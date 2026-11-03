import { LegalPageLoadError } from '../infrastructure/LegalPageLoadError'
import { findLegalPage } from '../infrastructure/legalPageRepository'

import type { LegalPage } from '../domain/legalPage'

/** Page légale administrée dans l'API : inconnue de l'API, introuvable ; échec, état d'erreur. */
export const loadLegalPage = async (slug: LegalPage.Slug): Promise<LegalPage.Load> => {
  let page: LegalPage.Entity | null
  try {
    page = await findLegalPage(slug)
  } catch {
    return { status: 'error', message: new LegalPageLoadError().message }
  }
  return page ? { status: 'success', page } : { status: 'not-found' }
}
