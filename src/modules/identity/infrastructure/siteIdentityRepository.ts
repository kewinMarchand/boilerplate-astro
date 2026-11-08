import { ApiError } from '@/shared/api/client'
import { serverApiClient } from '@/shared/api/client.server'

import { toSiteIdentity } from './http/siteIdentityTranslation'

import type { SiteIdentity } from '../domain/siteIdentity'

export const findSiteIdentity = async (): Promise<SiteIdentity> => {
  const { data, response } = await serverApiClient().GET('/api/site-identity')
  if (!data) throw new ApiError(response)
  return toSiteIdentity(data)
}
