import { parseCatalogQuery } from '../domain/catalogQuery'
import { listActiveFilters } from './activeFilters'

const parse = (search: string) => parseCatalogQuery(new URLSearchParams(search))

describe('filtres actifs', () => {
  it('liste une puce par filtre, chacune retirant le sien seulement', () => {
    const filters = listActiveFilters(parse('exposition=mi-ombre&taille=S&en_stock=1'), [])
    expect(filters.map((filter) => filter.label)).toEqual(['Mi-ombre', 'Taille petite', 'En stock'])
    expect(filters[0]?.query.exposures).toEqual([])
    expect(filters[0]?.query.sizes).toEqual(['S'])
  })

  it('libelle les attributs depuis les facettes, et retire une valeur seulement', () => {
    const filters = listActiveFilters(
      parse('attr-feuillage=persistant&attr-feuillage=caduc&attr-couleur=rouge'),
      [
        {
          code: 'feuillage',
          label: 'Feuillage',
          values: [
            { value: 'persistant', label: 'Persistant', count: 6 },
            { value: 'caduc', label: 'Caduc', count: 2 },
          ],
        },
      ],
    )
    expect(filters.map((filter) => filter.label)).toEqual([
      'Feuillage : Persistant',
      'Feuillage : Caduc',
      'couleur : rouge',
    ])
    expect(filters[0]?.query.attributes).toEqual({ feuillage: ['caduc'], couleur: ['rouge'] })
  })
})
