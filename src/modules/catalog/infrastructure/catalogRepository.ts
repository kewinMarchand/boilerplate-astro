import { ApiError } from '@/shared/api/client'
import { serverApiClient } from '@/shared/api/client.server'

import { resolveCategoryPath } from '../domain/categoryPath'
import { findCategoryChain } from '../domain/categoryTree'
import { toCategory, toListing, toProductsQuery } from './http/catalogTranslation'

import type { Catalog } from '../domain/catalog'

export const findCategoryTree = async (): Promise<Catalog.Category[]> => {
  const { data, response } = await serverApiClient().GET('/api/categories')
  if (!data) throw new ApiError(response)
  return data.map(toCategory)
}

/** Page du catalogue, ou null si le chemin de catégories n'existe pas dans l'arbre. */
export const findCatalogListing = async (
  slugs: string[],
  query: Catalog.Query,
): Promise<Catalog.Listing | null> => {
  const tree = await findCategoryTree()
  const chain = resolveCategoryPath(tree, slugs)
  const categories = findCategoryChain(tree, slugs)
  if (!chain || !categories) return null

  const { data, response } = await serverApiClient().GET('/api/products', {
    params: { query: toProductsQuery(slugs, query) },
  })
  if (!data) throw new ApiError(response)

  const current = categories.at(-1)
  return toListing(data, { chain, slugs, ...(current && { current }) })
}
