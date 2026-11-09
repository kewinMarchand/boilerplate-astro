import { format } from '@/shared/i18n'

import { withFilter } from '../domain/catalogQuery'

import type { Catalog } from '../domain/catalog'
import type { Dictionary } from '@/shared/i18n'

export interface ActiveFilter {
  label: string
  query: Catalog.Query
}

const attributeLabel = (
  facets: Catalog.AttributeFacet[],
  code: string,
  value: string,
  t: Dictionary['catalog'],
) => {
  const facet = facets.find((item) => item.code === code)
  const valueLabel = facet?.values.find((item) => item.value === value)?.label ?? value
  return format(t.attributeFilter, { attribute: facet?.label ?? code, value: valueLabel })
}

/** Les libellés des attributs viennent des facettes ; un code absent des facettes s'affiche tel quel. */
export const listActiveFilters = (
  query: Catalog.Query,
  attributeFacets: Catalog.AttributeFacet[],
  t: Dictionary['catalog'],
): ActiveFilter[] => {
  const without = (patch: Partial<Catalog.Query>) => withFilter(query, patch)
  return [
    ...query.exposures.map((value) => ({
      label: t.exposures[value],
      query: without({ exposures: query.exposures.filter((item) => item !== value) }),
    })),
    ...query.sizes.map((value) => ({
      label: format(t.sizeFilter, { size: t.sizes[value].toLowerCase() }),
      query: without({ sizes: query.sizes.filter((item) => item !== value) }),
    })),
    ...Object.entries(query.attributes).flatMap(([code, values]) =>
      values.map((value) => ({
        label: attributeLabel(attributeFacets, code, value, t),
        query: without({
          attributes: { ...query.attributes, [code]: values.filter((item) => item !== value) },
        }),
      })),
    ),
    ...(query.priceMin === undefined
      ? []
      : [
          {
            label: format(t.priceMinFilter, { euros: query.priceMin }),
            query: without({ priceMin: undefined }),
          },
        ]),
    ...(query.priceMax === undefined
      ? []
      : [
          {
            label: format(t.priceMaxFilter, { euros: query.priceMax }),
            query: without({ priceMax: undefined }),
          },
        ]),
    ...(query.inStock ? [{ label: t.inStock, query: without({ inStock: false }) }] : []),
  ]
}
