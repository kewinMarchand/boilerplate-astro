import { z } from 'zod'

import { EXPOSURES, SIZES, SORTS, VIEWS } from './catalog'

import type { Catalog } from './catalog'

const price = z.coerce.number().min(0).optional().catch(undefined)

const querySchema = z.object({
  exposures: z.array(z.string()).transform((values) => values.filter(isExposure)),
  sizes: z.array(z.string()).transform((values) => values.filter(isSize)),
  priceMin: price,
  priceMax: price,
  inStock: z.literal('1').optional().catch(undefined).transform(Boolean),
  sort: z.enum(SORTS).catch('pertinence'),
  view: z.enum(VIEWS).catch('grille'),
  page: z.coerce.number().int().min(1).catch(1),
})

function isExposure(value: string): value is Catalog.Exposure {
  return (EXPOSURES as readonly string[]).includes(value)
}

function isSize(value: string): value is Catalog.Size {
  return (SIZES as readonly string[]).includes(value)
}

const emptyToUndefined = (value: string | null) =>
  value === null || value === '' ? undefined : value

export const DEFAULT_QUERY: Catalog.Query = {
  exposures: [],
  sizes: [],
  priceMin: undefined,
  priceMax: undefined,
  inStock: false,
  sort: 'pertinence',
  view: 'grille',
  page: 1,
}

export const parseCatalogQuery = (params: URLSearchParams): Catalog.Query => {
  const parsed = querySchema.parse({
    exposures: params.getAll('exposition'),
    sizes: params.getAll('taille'),
    priceMin: emptyToUndefined(params.get('prix_min')),
    priceMax: emptyToUndefined(params.get('prix_max')),
    inStock: params.get('en_stock') ?? undefined,
    sort: params.get('tri') ?? undefined,
    view: params.get('vue') ?? undefined,
    page: params.get('page') ?? undefined,
  })
  return { ...parsed, priceMin: parsed.priceMin, priceMax: parsed.priceMax }
}

export const serializeCatalogQuery = (query: Catalog.Query): string => {
  const params = new URLSearchParams()
  query.exposures.forEach((value) => params.append('exposition', value))
  query.sizes.forEach((value) => params.append('taille', value))
  if (query.priceMin !== undefined) params.set('prix_min', String(query.priceMin))
  if (query.priceMax !== undefined) params.set('prix_max', String(query.priceMax))
  if (query.inStock) params.set('en_stock', '1')
  if (query.sort !== 'pertinence') params.set('tri', query.sort)
  if (query.view !== 'grille') params.set('vue', query.view)
  if (query.page >= 2) params.set('page', String(query.page))
  const search = params.toString()
  return search ? `?${search}` : ''
}

/** Tout changement de filtre, de tri ou de vue remet la page à 1 et conserve le reste. */
export const withFilter = (
  query: Catalog.Query,
  patch: Partial<Omit<Catalog.Query, 'page'>>,
): Catalog.Query => ({ ...query, ...patch, page: 1 })

export const clearFilters = (query: Catalog.Query): Catalog.Query => ({
  ...DEFAULT_QUERY,
  view: query.view,
})

export const countActiveFilters = (query: Catalog.Query) =>
  query.exposures.length +
  query.sizes.length +
  Number(query.priceMin !== undefined) +
  Number(query.priceMax !== undefined) +
  Number(query.inStock)

/** Une liste filtrée, triée ou en vue liste est une variante : elle n'est pas indexée. */
export const isFiltered = (query: Catalog.Query) =>
  countActiveFilters(query) > 0 || query.sort !== 'pertinence' || query.view !== 'grille'

export const queryEntries = (query: Catalog.Query, omit: string[] = []): [string, string][] =>
  [...new URLSearchParams(serializeCatalogQuery({ ...query, page: 1 }))].filter(
    ([name]) => !omit.includes(name),
  )

export const queryFromFormData = (data: FormData): Catalog.Query => {
  const params = new URLSearchParams()
  for (const [name, value] of data) {
    if (typeof value === 'string') params.append(name, value)
  }
  return { ...parseCatalogQuery(params), page: 1 }
}
