import { SITE_IDENTITY_FALLBACK } from '@/shared/config'

import { findSiteIdentity } from '../infrastructure/siteIdentityRepository'

import type { SiteIdentity } from '../domain/siteIdentity'

/** Identité administrée dans l'API ; API en erreur ou injoignable, celle de la configuration du site. */
export const loadSiteIdentity = async (): Promise<SiteIdentity> => {
  try {
    return await findSiteIdentity()
  } catch {
    return SITE_IDENTITY_FALLBACK
  }
}
