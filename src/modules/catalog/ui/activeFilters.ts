import { withFilter } from '../domain/catalogQuery'
import { EXPOSURE_LABELS, SIZE_LABELS } from './labels'

import type { Catalog } from '../domain/catalog'

export interface ActiveFilter {
  label: string
  query: Catalog.Query
}

export const listActiveFilters = (query: Catalog.Query): ActiveFilter[] => {
  const without = (patch: Partial<Catalog.Query>) => withFilter(query, patch)
  return [
    ...query.exposures.map((value) => ({
      label: EXPOSURE_LABELS[value],
      query: without({ exposures: query.exposures.filter((item) => item !== value) }),
    })),
    ...query.sizes.map((value) => ({
      label: `Taille ${SIZE_LABELS[value].toLowerCase()}`,
      query: without({ sizes: query.sizes.filter((item) => item !== value) }),
    })),
    ...(query.priceMin === undefined
      ? []
      : [{ label: `Prix min. ${query.priceMin} €`, query: without({ priceMin: undefined }) }]),
    ...(query.priceMax === undefined
      ? []
      : [{ label: `Prix max. ${query.priceMax} €`, query: without({ priceMax: undefined }) }]),
    ...(query.inStock ? [{ label: 'En stock', query: without({ inStock: false }) }] : []),
  ]
}
