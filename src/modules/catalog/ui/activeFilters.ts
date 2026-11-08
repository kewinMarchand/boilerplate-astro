import { withFilter } from '../domain/catalogQuery'
import { EXPOSURE_LABELS, SIZE_LABELS } from './labels'

import type { Catalog } from '../domain/catalog'

export interface ActiveFilter {
  label: string
  query: Catalog.Query
}

const attributeLabel = (facets: Catalog.AttributeFacet[], code: string, value: string) => {
  const facet = facets.find((item) => item.code === code)
  const valueLabel = facet?.values.find((item) => item.value === value)?.label ?? value
  return `${facet?.label ?? code} : ${valueLabel}`
}

/** Les libellés des attributs viennent des facettes ; un code absent des facettes s'affiche tel quel. */
export const listActiveFilters = (
  query: Catalog.Query,
  attributeFacets: Catalog.AttributeFacet[],
): ActiveFilter[] => {
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
    ...Object.entries(query.attributes).flatMap(([code, values]) =>
      values.map((value) => ({
        label: attributeLabel(attributeFacets, code, value),
        query: without({
          attributes: { ...query.attributes, [code]: values.filter((item) => item !== value) },
        }),
      })),
    ),
    ...(query.priceMin === undefined
      ? []
      : [{ label: `Prix min. ${query.priceMin} €`, query: without({ priceMin: undefined }) }]),
    ...(query.priceMax === undefined
      ? []
      : [{ label: `Prix max. ${query.priceMax} €`, query: without({ priceMax: undefined }) }]),
    ...(query.inStock ? [{ label: 'En stock', query: without({ inStock: false }) }] : []),
  ]
}
