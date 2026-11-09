import { productHref } from '../domain/catalog'
import {
  findAllProductSlugs,
  findFeaturedProducts,
  findProduct,
  findSimilarProducts,
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

/**
 * Slug et nom de la fiche dans chaque langue du site (panier affiché dans une autre langue que celle de
 * l'ajout) ; aucun sur un site monolingue (`alternates` vide), sans appel. Une langue que l'API ne sert pas
 * est omise.
 */
export const loadProductTranslations = async (
  product: Catalog.ProductDetail,
  locale: string,
): Promise<Catalog.ProductTranslation[]> => {
  const translations = await Promise.all(
    product.alternates.map(async (alternate) => {
      if (alternate.locale === locale) return { locale, slug: product.slug, name: product.name }
      const slug = alternate.path.slice(productHref('').length)
      const translated = await findProduct(slug, alternate.locale).catch(() => null)
      return (
        translated && { locale: alternate.locale, slug: translated.slug, name: translated.name }
      )
    }),
  )
  return translations.filter((translation) => translation !== null)
}

/** Produit d'une demande de renseignement ; aucun sans slug, slug inconnu ou API en erreur. */
export const loadProductLink = async (slug: string | null): Promise<Catalog.ProductLink | null> => {
  if (!slug) return null
  const product = await findProduct(slug).catch(() => null)
  return product && { slug: product.slug, name: product.name, path: productHref(product.slug) }
}

/** Produits similaires de la fiche (même catégorie) ; aucun si l'API ne répond pas : la fiche reste l'essentiel. */
export const loadSimilarProducts = (categorySlug: string, excludedSlug: string) =>
  findSimilarProducts(categorySlug, excludedSlug).catch(() => [])

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

/** Fiches d'une langue pour le sitemap, associées d'une langue à l'autre par `key` ; aucune si l'API ne répond pas. */
export const listProductEntries = async (
  locale: string,
): Promise<{ key: string; path: AppPath }[]> =>
  (await findAllProductSlugs(locale).catch(() => [])).map(({ id, slug }) => ({
    key: id,
    path: productHref(slug),
  }))
