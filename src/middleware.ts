import { defineMiddleware } from 'astro:middleware'

import { withRequestScenario } from '@/shared/api/client.server'
import { compressHtml } from '@/shared/http'
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

import { MAINTENANCE_HTML, MAINTENANCE_RETRY_AFTER_SECONDS } from '@/views/errors'

announceStartup()

// MAINTENANCE=1 : toutes les pages répondent 503 avec la page autonome de maintenance. Sinon, la requête
// porte son X-Scenario jusqu'à l'API, l'identité du site, les métadonnées des pages fixes et le menu des
// catégories sont chargés une fois pour le layout (avec le lien du panier si la vente en ligne est active),
// et la réponse reçoit la CSP Report-Only, bloc des couleurs de marque compris. Seules les erreurs
// inattendues remontent à GlitchTip.
export const onRequest = defineMiddleware((context, next) => {
  if (process.env['MAINTENANCE'] === '1') {
    return new Response(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': String(MAINTENANCE_RETRY_AFTER_SECONDS),
      },
    })
  }

  if (context.isPrerendered) return next()

  return withRequestScenario(context.request, async () => {
    const [siteIdentity, pageMetas, categoryMenu] = await Promise.all([
      loadSiteIdentity(),
      loadPageMetas(),
      getCategoryMenu(),
    ])
    context.locals.siteIdentity = siteIdentity
    if (siteIdentity.salesEnabled) context.locals.cartLink = CartLink
    context.locals.pageMetas = pageMetas
    context.locals.categoryMenu = categoryMenu
    let response: Response
    try {
      response = await next()
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
  })
})
