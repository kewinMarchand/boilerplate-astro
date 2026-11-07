import { productHref } from '../domain/catalog'
import {
  findAllProductSlugs,
  findFeaturedProducts,
  findProduct,
} from '../infrastructure/catalogRepository'
import { FeaturedProductsLoadError } from './FeaturedProductsLoadError'
import { ProductLoadError } from './ProductLoadError'

import type { Catalog } from '../domain/catalog'
import type { AppPath } from '@/shared/routing'

export const loadProduct = async (slug: string): Promise<Catalog.ProductLoad> => {
  try {
    const product = await findProduct(slug)
    return product ? { status: 'success', product } : { status: 'not-found' }
  } catch {
    return { status: 'error', message: new ProductLoadError().message }
  }
}

export const loadFeaturedProducts = async () => {
  try {
    const featured: Catalog.Featured = {
      status: 'success',
      products: await findFeaturedProducts(),
    }
    return { featured }
  } catch {
    const featured: Catalog.Featured = {
      status: 'error',
      message: new FeaturedProductsLoadError().message,
    }
    return { featured }
  }
}

/** Chemins des fiches pour le sitemap ; aucun si l'API ne répond pas. */
export const listProductPaths = async (): Promise<AppPath[]> =>
  (await findAllProductSlugs().catch(() => [])).map(productHref)
