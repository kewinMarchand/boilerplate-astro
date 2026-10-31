import { parseCatalogQuery } from '../domain/catalogQuery'
import { listActiveFilters } from './activeFilters'

const parse = (search: string) => parseCatalogQuery(new URLSearchParams(search))

describe('filtres actifs', () => {
  it('liste une puce par filtre, chacune retirant le sien seulement', () => {
    const filters = listActiveFilters(parse('exposition=mi-ombre&taille=S&en_stock=1'))
    expect(filters.map((filter) => filter.label)).toEqual(['Mi-ombre', 'Taille petite', 'En stock'])
    expect(filters[0]?.query.exposures).toEqual([])
    expect(filters[0]?.query.sizes).toEqual(['S'])
  })
})
