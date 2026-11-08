import { findPageMetas } from '../infrastructure/siteIdentityRepository'

import type { PageMetas } from '../domain/pageMetas'

/** Métadonnées des pages fixes ; API en erreur ou injoignable, aucune : les pages gardent leurs valeurs. */
export const loadPageMetas = async (): Promise<PageMetas> => {
  try {
    return await findPageMetas()
  } catch {
    return {}
  }
}
