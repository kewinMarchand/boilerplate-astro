import { localizePath } from '@/shared/i18n/locale'
import { pageLanguage } from '@/shared/i18n/pageLanguage'

export type AppPath = `/${string}`

/**
 * Seul point qui construit un lien interne : chemin sans préfixe de langue (`/catalogue`), préfixé par la
 * langue de la page, ou par `locale` (sélecteur de langue, rendu sur le serveur), sauf pour la langue par
 * défaut (`/en/catalogue`). Astro sert le site à la racine : le chemin est déjà l'URL.
 */
export const resolveHref = (path: AppPath, locale?: string): AppPath => {
  const page = pageLanguage()
  return page ? localizePath(path, locale ?? page.locale, page.defaultLocale) : path
}

// Les pages pré-rendues reçoivent leur chemin avec une barre finale : on la retire (canonique, fil d'Ariane).
export const toAppPath = (pathname: string): AppPath =>
  `/${pathname.replace(/^\/+/, '').replace(/\/+$/, '')}`
