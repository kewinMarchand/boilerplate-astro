import type { Price } from './price'
import type { AppPath } from '@/shared/routing'

export const EXPOSURES = ['soleil', 'mi-ombre', 'ombre'] as const
export const SIZES = ['S', 'M', 'L'] as const
export const SORTS = ['pertinence', 'prix-asc', 'prix-desc', 'nom'] as const
export const VIEWS = ['grille', 'liste'] as const
export const PAGE_SIZE = 12

export declare namespace Catalog {
  type Exposure = (typeof EXPOSURES)[number]
  type Size = (typeof SIZES)[number]
  type Sort = (typeof SORTS)[number]
  type View = (typeof VIEWS)[number]
  type Facet = 'exposure' | 'size'

  interface Product {
    id: string
    slug: string
    name: string
    categorySlug: string
    price: Price
    exposure: Exposure
    size: Size
    inStock: boolean
    image: number
  }

  interface Category {
    slug: string
    name: string
    description: string
    children: Category[]
  }

  interface CategoryLink {
    slug: string
    name: string
    path: AppPath
  }

  /** Chaîne des catégories de la racine à la catégorie courante, validée contre l'arbre. */
  type CategoryPath = CategoryLink[]

  interface Query {
    exposures: Exposure[]
    sizes: Size[]
    priceMin: number | undefined
    priceMax: number | undefined
    inStock: boolean
    sort: Sort
    view: View
    page: number
  }

  interface FacetCount<T extends string> {
    value: T
    count: number
  }

  interface Facets {
    exposure: FacetCount<Exposure>[]
    size: FacetCount<Size>[]
  }

  interface Listing {
    chain: CategoryPath
    description: string
    children: (CategoryLink & { count: number })[]
    products: Product[]
    total: number
    page: number
    totalPages: number
    facets: Facets
  }

  type Result = { status: 'success'; listing: Listing } | { status: 'error'; message: string }

  type Status = 'pending' | 'error' | 'success'
}
