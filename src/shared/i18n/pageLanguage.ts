import { localePrefix } from './locale'

import type { LocaleContext } from './locale'

/** Langue des liens de la page : `defaultLocale` inconnue dans le navigateur sur une page préfixée. */
export type PageLanguage = Pick<LocaleContext, 'locale'> & { defaultLocale: string | undefined }

let serverSource: (() => PageLanguage | undefined) | undefined

/** Posée une fois par le module serveur de la langue de la requête (`requestLocale.server`, chargé par le middleware). */
export const setPageLanguageSource = (source: () => PageLanguage | undefined) => {
  serverSource = source
}

/**
 * Le navigateur ne voit que le document : une page servie sous le préfixe de sa langue (`<html lang="en">`
 * et `/en/...`, préfixe validé par le serveur) est hors de la langue par défaut ; sans préfixe, aucun.
 */
const documentLanguage = (): PageLanguage | undefined => {
  if (typeof document === 'undefined') return undefined
  const { lang } = document.documentElement
  return localePrefix(location.pathname) === lang
    ? { locale: lang, defaultLocale: undefined }
    : undefined
}

/** Serveur : langue de la requête en cours ; navigateur : celle du document ; aucune hors requête. */
export const pageLanguage = () => serverSource?.() ?? documentLanguage()
