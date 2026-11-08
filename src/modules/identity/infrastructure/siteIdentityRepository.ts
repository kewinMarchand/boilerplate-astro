import { ApiError } from '@/shared/api/client'
import { serverApiClient } from '@/shared/api/client.server'

import { toPageMetas } from './http/pageMetasTranslation'
import { toSiteIdentity } from './http/siteIdentityTranslation'

import type { PageMetas } from '../domain/pageMetas'
import type { SiteIdentity } from '../domain/siteIdentity'

export const findSiteIdentity = async (): Promise<SiteIdentity> => {
  const { data, response } = await serverApiClient().GET('/api/site-identity')
  if (!data) throw new ApiError(response)
  return toSiteIdentity(data)
}

export const findPageMetas = async (): Promise<PageMetas> => {
  const { data, response } = await serverApiClient().GET('/api/page-metas')
  if (!data) throw new ApiError(response)
  return toPageMetas(data)
}
