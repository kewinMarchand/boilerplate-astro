import { CATALOG_NAVIGATION, navigationLabel } from '@/shared/config'
import { localizedUrl } from '@/shared/seo'
import { largestWebp } from '@/shared/ui/kit'

import { isFiltered, serializeCatalogQuery } from '../domain/catalogQuery'
import { CATALOG_ROOT_PATH, categoryTrail } from '../domain/categoryPath'

import type { Catalog } from '../domain/catalog'
import type { Dictionary, LocaleContext } from '@/shared/i18n'
import type { AppPath } from '@/shared/routing'
import type { Seo } from '@/shared/seo'

export interface CatalogPageDescription {
  path: AppPath
  title: string
  description: string
  /** Racine du catalogue : page fixe, métadonnées saisies dans l'admin. */
  page: Seo.PageKey | undefined
  parents: Seo.BreadcrumbItem[]
  seo: Omit<Seo.Input, 'title' | 'description' | 'path' | 'breadcrumb'>
}

/**
 * En-tête d'une page du catalogue (titre, fil d'Ariane, SEO), calculé côté serveur par la page Astro, dans la
 * langue de la page. Chemins sans préfixe de langue : la canonique et prev/next le reçoivent de `buildPageMeta`.
 */
export const describeCatalogPage = (
  query: Catalog.Query,
  result: Catalog.Result,
  t: Dictionary,
  locale: LocaleContext,
): CatalogPageDescription => {
  const catalogLabel = navigationLabel(CATALOG_NAVIGATION, t)
  const listing = result.status === 'success' ? result.listing : undefined
  const chain = listing?.chain ?? []
  const current = chain.at(-1)
  const path = current?.path ?? CATALOG_ROOT_PATH
  const firstProduct = listing?.products[0]

  return {
    path,
    title: current?.name ?? catalogLabel,
    description: listing?.description ?? t.catalog.description,
    page: current ? undefined : 'catalog',
    parents: current
      ? [{ label: catalogLabel, path: CATALOG_ROOT_PATH }, ...categoryTrail(chain)]
      : [],
    seo: {
      noindex: isFiltered(query),
      canonicalPath: query.page >= 2 ? `${path}?page=${query.page}` : path,
      prevPath:
        query.page > 1
          ? `${path}${serializeCatalogQuery({ ...query, page: query.page - 1 })}`
          : undefined,
      nextPath:
        listing && query.page < listing.totalPages
          ? `${path}${serializeCatalogQuery({ ...query, page: query.page + 1 })}`
          : undefined,
      image: firstProduct?.image
        ? {
            path: largestWebp(firstProduct.image),
            width: firstProduct.image.width,
            height: firstProduct.image.height,
            alt: firstProduct.image.alt,
          }
        : undefined,
      jsonLd: listing && [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: listing.products.map((product, index) => ({
            '@type': 'ListItem',
            position: (listing.page - 1) * listing.products.length + index + 1,
            name: product.name,
            url: localizedUrl(`${path}#${product.slug}`, locale),
          })),
        },
      ],
    },
  }
}
