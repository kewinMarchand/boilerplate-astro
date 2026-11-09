import { EXPOSURES, PAGE_SIZE, productHref, SIZES } from '@/modules/catalog/domain/catalog'
import { categoryAlternates, categoryHref } from '@/modules/catalog/domain/categoryPath'
import { eurosToCents, Price } from '@/modules/catalog/domain/price'

import { categoryDescription } from './categoryDescriptions'

import type { Catalog } from '@/modules/catalog/domain/catalog'
import type { components, operations } from '@/shared/api/client'

type CategoryDto = components['schemas']['Category']
type ProductDto = components['schemas']['Product']
type ProductDetailDto = components['schemas']['ProductDetail']
type ProductFacetsDto = components['schemas']['ProductFacets']
type FacetDto = components['schemas']['FacetValue']
export type ProductsQuery = NonNullable<
  operations['api_products_get_collection']['parameters']['query']
>
export type ProductFacetsQuery = NonNullable<
  operations['api_product-facets_get']['parameters']['query']
>

const SORT_PARAMS: Record<Catalog.Sort, ProductsQuery> = {
  pertinence: {},
  'prix-asc': { 'order[price]': 'asc' },
  'prix-desc': { 'order[price]': 'desc' },
  nom: { 'order[name]': 'asc' },
}

/** `language` : langue de la réponse (`Content-Language`), qui choisit la description éditoriale. */
export const toCategory = (dto: CategoryDto, language: string): Catalog.Category => ({
  slug: dto.slug,
  name: dto.name,
  description: categoryDescription(
    language,
    dto.alternates.find((alternate) => alternate.locale === 'fr')?.slug ?? dto.slug,
  ),
  children: dto.children.map((child) => toCategory(child, language)),
  alternates: dto.alternates,
})

export const toProduct = (dto: ProductDto): Catalog.Product => ({
  id: String(dto.id),
  slug: dto.slug,
  name: dto.name,
  categorySlug: dto.categorySlug,
  price: Price.fromCents(dto.price),
  exposure: dto.exposure,
  size: dto.size,
  inStock: dto.inStock,
  image: dto.image,
})

export const toProductDetail = (dto: ProductDetailDto): Catalog.ProductDetail => ({
  ...toProduct(dto),
  categoryPath: dto.categoryPath.map((link, index) => ({
    slug: link.slug,
    name: link.name,
    path: categoryHref(dto.categoryPath.slice(0, index + 1).map((step) => step.slug)),
  })),
  // Le contrat sépare les paragraphes par une ligne vide
  description: dto.description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== ''),
  attributes: dto.attributes.map((attribute) => ({
    code: attribute.code,
    label: attribute.label,
    value: attribute.valueLabel,
    unit: attribute.unit,
  })),
  gallery: dto.gallery,
  metaTitle: dto.metaTitle.trim(),
  metaDescription: dto.metaDescription.trim(),
  alternates: dto.alternates.map(({ locale, slug }) => ({ locale, path: productHref(slug) })),
})

const toFacetCounts = <T extends string>(values: readonly T[], dtos: FacetDto[]) =>
  values.map((value) => ({
    value,
    count: dtos.find((dto) => dto.value === value)?.count ?? 0,
  }))

/** Filtres communs à la liste et aux facettes : euros de l'URL en centimes, listes en clés répétées. */
export const toFacetsQuery = (slugs: string[], query: Catalog.Query): ProductFacetsQuery => {
  const category = slugs.at(-1)
  const attributes = Object.entries(query.attributes).filter(([, values]) => values.length > 0)
  return {
    ...(category && { category }),
    ...(query.exposures.length > 0 && { 'exposure[]': query.exposures }),
    ...(query.sizes.length > 0 && { 'size[]': query.sizes }),
    ...(attributes.length > 0 && { attributes: Object.fromEntries(attributes) }),
    ...(query.priceMin !== undefined && { priceMin: eurosToCents(query.priceMin) }),
    ...(query.priceMax !== undefined && { priceMax: eurosToCents(query.priceMax) }),
    ...(query.inStock && { inStock: true }),
  }
}

/** Filtres, tri du front en `order[...]` et page demandée. */
export const toProductsQuery = (slugs: string[], query: Catalog.Query): ProductsQuery => ({
  ...toFacetsQuery(slugs, query),
  ...SORT_PARAMS[query.sort],
  page: query.page,
  itemsPerPage: PAGE_SIZE,
})

export const toListing = (
  products: ProductDto[],
  facets: ProductFacetsDto,
  page: number,
  {
    chain,
    slugs,
    categories,
    languages,
    language,
  }: {
    chain: Catalog.CategoryPath
    slugs: string[]
    categories: Catalog.Category[]
    languages: Catalog.Languages
    language: string
  },
): Catalog.Listing => ({
  chain,
  alternates: categoryAlternates(categories, languages),
  description: categories.at(-1)?.description ?? categoryDescription(language),
  children: facets.category.map((child) => ({
    slug: child.slug,
    name: child.name,
    path: categoryHref([...slugs, child.slug]),
    count: child.count,
  })),
  products: products.map(toProduct),
  total: facets.totalItems,
  page,
  totalPages: Math.max(1, Math.ceil(facets.totalItems / PAGE_SIZE)),
  facets: {
    exposure: toFacetCounts(EXPOSURES, facets.exposure),
    size: toFacetCounts(SIZES, facets.size),
    attributes: facets.attributes.map((facet) => ({
      code: facet.code,
      label: facet.label,
      values: facet.values.map(({ value, label, count }) => ({ value, label, count })),
    })),
  },
})
