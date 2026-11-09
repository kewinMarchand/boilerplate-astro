import { en } from './dictionaries/en'
import { fr } from './dictionaries/fr'

import type { Dictionary } from './dictionaries/dictionary'
import type { LocaleContext } from './locale'

export { withRequestLocale } from './requestLocale.server'

const DICTIONARIES: Record<string, Dictionary> = { fr, en }

/**
 * Dictionnaire de la langue de la page ; sans fichier de traduction, celui de la langue par défaut (le
 * français à défaut). Module serveur : un îlot reçoit en propriété les seuls libellés qu'il affiche, aucun
 * dictionnaire n'entre dans le JavaScript du navigateur.
 */
export const dictionaryFor = ({ locale, defaultLocale }: LocaleContext) =>
  DICTIONARIES[locale] ?? DICTIONARIES[defaultLocale] ?? fr
