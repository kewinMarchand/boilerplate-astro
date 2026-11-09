import type { AppPath } from '@/shared/routing'

/** Langue par défaut quand les langues du site sont inconnues : le français. */
export const FALLBACK_LOCALE = 'fr'

/** Langue de la page et langues du site (`locales` de l'identité, la première est la langue par défaut). */
export interface LocaleContext {
  locale: string
  defaultLocale: string
  locales: string[]
}

/** Un élément dans une langue : chemin sans préfixe de langue (`/produit/swiss-cheese-plant`). */
export interface LanguageAlternate {
  locale: string
  path: AppPath
}

const isInternalPath = (path: string) => path.startsWith('/') && !path.startsWith('//')

/** Premier segment d'un chemin s'il a la forme d'un préfixe de langue (`en`), sinon `undefined`. */
export const localePrefix = (path: string) => {
  const first = path.split(/[/?#]/)[1] ?? ''
  return /^[a-z]{2}$/.test(first) ? first : undefined
}

/** Langue d'une adresse publique : son préfixe s'il désigne une langue activée autre que la langue par défaut. */
export const pathLocale = (path: string, locales: string[]) => {
  const [defaultLocale = FALLBACK_LOCALE, ...prefixed] = locales
  const prefix = localePrefix(path)
  return prefix && prefixed.includes(prefix) ? prefix : defaultLocale
}

export const localeContext = (path: string, locales: string[]): LocaleContext => ({
  locale: pathLocale(path, locales),
  defaultLocale: locales[0] ?? FALLBACK_LOCALE,
  locales,
})

/**
 * Chemin dans une langue : sans préfixe pour la langue par défaut, `/en/...` pour les autres. Langue par
 * défaut inconnue (`undefined`, navigateur sur une page préfixée) : préfixé.
 */
export const localizePath = <P extends string>(
  path: P,
  locale: string,
  defaultLocale: string | undefined,
): P | AppPath => {
  if (locale === defaultLocale || !isInternalPath(path)) return path
  return path === '/' || /^\/[?#]/.test(path) ? `/${locale}${path.slice(1)}` : `/${locale}${path}`
}

/** Chemin sans le préfixe de la langue de la page (`/en/catalogue` → `/catalogue`). */
export const unlocalizePath = (path: string, { locale, defaultLocale }: LocaleContext) => {
  if (locale === defaultLocale) return path
  if (path === `/${locale}`) return '/'
  return path.startsWith(`/${locale}/`) ? path.slice(locale.length + 1) : path
}

/** Même chemin dans chaque langue : pages fixes, dont les segments ne se traduisent pas. */
export const samePathInEveryLocale = ({ locales }: LocaleContext, path: AppPath) =>
  locales.map((locale): LanguageAlternate => ({ locale, path }))

interface LocaleEntries {
  locale: string
  entries: { key: string; path: AppPath }[]
}

/**
 * Un groupe par élément (sitemap) : son chemin dans chaque langue, associé par `key` (identifiant
 * stable de l'élément), dans l'ordre de la première langue, la langue par défaut.
 */
export const alternatesByKey = ([first, ...others]: LocaleEntries[]): LanguageAlternate[][] =>
  first
    ? first.entries.map(({ key, path }) => [
        { locale: first.locale, path },
        ...others.flatMap(({ locale, entries }) => {
          const match = entries.find((entry) => entry.key === key)
          return match ? [{ locale, path: match.path }] : []
        }),
      ])
    : []

const OG_LOCALES: Record<string, string> = { fr: 'fr_FR', en: 'en_US' }

/** Langue au format Open Graph (`fr_FR`), le code seul pour une langue sans région connue. */
export const ogLocale = (locale: string) => OG_LOCALES[locale] ?? locale

/** Nom d'une langue dans cette langue (« Français », « English »), pour le sélecteur. */
export const languageName = (locale: string) => {
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** Langue demandée par un formulaire (champ caché `locale`) si le site l'a activée, sinon celle de la page. */
export const requestedLocale = (requested: unknown, { locale, locales }: LocaleContext) =>
  typeof requested === 'string' && locales.includes(requested) ? requested : locale
