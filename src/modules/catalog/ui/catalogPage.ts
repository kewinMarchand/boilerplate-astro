import { CATALOG_NAVIGATION } from '@/shared/config'
import { absoluteUrl } from '@/shared/seo'

import { isFiltered } from '../domain/catalogQuery'
import { CATALOG_ROOT_PATH, categoryTrail } from '../domain/categoryPath'
import { catalogHref } from './hooks/useCatalogNavigation.svelte'

import type { Catalog } from '../domain/catalog'
import type { AppPath } from '@/shared/routing'
import type { Seo } from '@/shared/seo'

export interface CatalogPageDescription {
  path: AppPath
  title: string
  description: string
  parents: Seo.BreadcrumbItem[]
  seo: Omit<Seo.Input, 'title' | 'description' | 'path' | 'breadcrumb'>
}

/** En-tête d'une page du catalogue (titre, fil d'Ariane, SEO), calculé côté serveur par la page Astro. */
export const describeCatalogPage = (
  query: Catalog.Query,
  result: Catalog.Result,
): CatalogPageDescription => {
  const listing = result.status === 'success' ? result.listing : undefined
  const chain = listing?.chain ?? []
  const current = chain.at(-1)
  const path = current?.path ?? CATALOG_ROOT_PATH
  const firstProduct = listing?.products[0]

  return {
    path,
    title: current?.name ?? CATALOG_NAVIGATION.label,
    description: listing?.description ?? 'Catalogue de notre jardinerie tropicale.',
    parents: current
      ? [{ label: CATALOG_NAVIGATION.label, path: CATALOG_ROOT_PATH }, ...categoryTrail(chain)]
      : [],
    seo: {
      noindex: isFiltered(query),
      canonicalPath: query.page >= 2 ? `${path}?page=${query.page}` : path,
      prevPath: query.page > 1 ? catalogHref(path, { ...query, page: query.page - 1 }) : undefined,
      nextPath:
        listing && query.page < listing.totalPages
          ? catalogHref(path, { ...query, page: query.page + 1 })
          : undefined,
      image: firstProduct && {
        path: `/images/product-${firstProduct.image}-800.webp`,
        width: 800,
        height: 800,
        alt: firstProduct.name,
      },
      jsonLd: listing && [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: listing.products.map((product, index) => ({
            '@type': 'ListItem',
            position: (listing.page - 1) * listing.products.length + index + 1,
            name: product.name,
            url: absoluteUrl(`${path}#${product.slug}`),
          })),
        },
      ],
    },
  }
}
