import { defineMiddleware } from 'astro:middleware'

import { withRequestLanguage, withRequestScenario } from '@/shared/api/client.server'
import { compressHtml } from '@/shared/http'
import { FALLBACK_LOCALE, localeContext, localePrefix, unlocalizePath } from '@/shared/i18n'
import { dictionaryFor, withRequestLocale } from '@/shared/i18n/index.server'
import { SCENARIO_HEADER } from '@/shared/observability'
import { reportServerError } from '@/shared/observability/index.server'
import {
  announceStartup,
  ASTRO_ISLAND_STYLE,
  CSP_HEADER,
  siteCspHeader,
} from '@/shared/security/index.server'
import { brandThemeCss } from '@/shared/theme/brandTheme'

import { CartLink } from '@/modules/cart'
import { getCategoryMenu } from '@/modules/catalog/index.server'
import { loadPageMetas, loadSiteIdentity } from '@/modules/identity/index.server'

import { MAINTENANCE_RETRY_AFTER_SECONDS, maintenancePage } from '@/views/errors'

announceStartup()

const MAINTENANCE_LOCALES_TIMEOUT_MS = 2000

/** Langues du site pour la page de maintenance, `fr` si l'API, parfois arrêtée elle aussi, ne répond pas à temps. */
const maintenanceLocales = () =>
  Promise.race([
    loadSiteIdentity().then(({ locales }) => locales),
    new Promise<string[]>((resolve) =>
      setTimeout(resolve, MAINTENANCE_LOCALES_TIMEOUT_MS, [FALLBACK_LOCALE]),
    ),
  ])

// MAINTENANCE=1 : toutes les pages répondent 503 avec la page autonome de maintenance, dans la langue de
// l'adresse. Sinon, la requête
// porte son X-Scenario jusqu'à l'API ; l'identité du site est lue dans la langue demandée par l'adresse
// (`/en/...`), qui donne les langues du site et la langue de la page ; métadonnées des pages fixes et menu
// des catégories sont chargés dans cette langue pour le layout (avec le lien du panier si la vente en ligne
// est active), et la réponse reçoit la CSP Report-Only, bloc des couleurs de marque compris. Seules les
// erreurs inattendues remontent à GlitchTip.
export const onRequest = defineMiddleware(async (context, next) => {
  if (process.env['MAINTENANCE'] === '1') {
    return new Response(maintenancePage(context.url.pathname, await maintenanceLocales()), {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': String(MAINTENANCE_RETRY_AFTER_SECONDS),
      },
    })
  }

  if (context.isPrerendered) return next()

  return withRequestScenario(context.request, async () => {
    const { pathname, search } = context.url
    // `Astro.rewrite('/404')` d'une page rejoue le middleware sur l'adresse réécrite : la langue posée par le
    // premier passage reste celle de la page.
    const known = context.locals.locale
    const prefix = localePrefix(pathname)
    // Sans préfixe, la page est dans la langue par défaut, que l'API sert sans paramètre : métadonnées et menu
    // se lisent en même temps que l'identité. Sous un préfixe, il faut d'abord savoir si la langue est activée.
    const defaultLanguageData =
      known || prefix ? undefined : Promise.all([loadPageMetas(), getCategoryMenu()])
    const siteIdentity = known ? context.locals.siteIdentity : await loadSiteIdentity(prefix)
    const locale = known ?? localeContext(pathname, siteIdentity.locales)

    const apiLanguage = { locale: locale.locale, multilingual: locale.locales.length > 1 }
    return withRequestLocale(locale, () =>
      withRequestLanguage(apiLanguage, async () => {
        const [pageMetas, categoryMenu] = await (defaultLanguageData ??
          Promise.all([loadPageMetas(), getCategoryMenu()]))
        context.locals.siteIdentity = siteIdentity
        context.locals.locale = locale
        context.locals.dictionary = dictionaryFor(locale)
        if (siteIdentity.salesEnabled) context.locals.cartLink = CartLink
        context.locals.pageMetas = pageMetas
        context.locals.categoryMenu = categoryMenu
        let response: Response
        try {
          // Langue autre que la langue par défaut : `/en/produit/x` est servi par la route `/produit/x`. Un
          // préfixe qui n'est pas une telle langue (`/fr/...`, `/de/...`) reste : aucune route, 404.
          response =
            locale.locale !== locale.defaultLocale && prefix === locale.locale
              ? await next(new URL(`${unlocalizePath(pathname, locale)}${search}`, context.url))
              : await next()
        } catch (error) {
          if (!context.request.headers.get(SCENARIO_HEADER)) await reportServerError(error)
          throw error
        }
        const { theme } = siteIdentity
        response.headers.set(
          CSP_HEADER,
          siteCspHeader(theme ? [ASTRO_ISLAND_STYLE, brandThemeCss(theme)] : []),
        )
        return compressHtml(context.request, response)
      }),
    )
  })
})
