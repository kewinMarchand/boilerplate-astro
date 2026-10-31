import {
  clearFilters,
  DEFAULT_QUERY,
  isFiltered,
  parseCatalogQuery,
  serializeCatalogQuery,
  withFilter,
} from './catalogQuery'

const parse = (search: string) => parseCatalogQuery(new URLSearchParams(search))

describe('parseCatalogQuery', () => {
  it('lit chaque paramètre, avec les clés répétées', () => {
    expect(
      parse(
        'exposition=soleil&exposition=ombre&taille=M&prix_min=10&prix_max=40&en_stock=1&tri=prix-asc&vue=liste&page=2',
      ),
    ).toEqual({
      exposures: ['soleil', 'ombre'],
      sizes: ['M'],
      priceMin: 10,
      priceMax: 40,
      inStock: true,
      sort: 'prix-asc',
      view: 'liste',
      page: 2,
    })
  })

  it('ignore les valeurs invalides', () => {
    expect(
      parse('exposition=lune&taille=XL&prix_min=abc&tri=hasard&vue=mosaique&page=-3&en_stock=oui'),
    ).toEqual(DEFAULT_QUERY)
  })
})

describe('serializeCatalogQuery', () => {
  it('fait l’aller-retour sans perte', () => {
    const search =
      '?exposition=soleil&taille=S&taille=L&prix_max=30&en_stock=1&tri=nom&vue=liste&page=3'
    expect(serializeCatalogQuery(parse(search))).toBe(search)
  })

  it('omet les valeurs par défaut', () => {
    expect(serializeCatalogQuery(DEFAULT_QUERY)).toBe('')
  })
})

describe('withFilter', () => {
  it('remet la page à 1 et conserve les autres paramètres', () => {
    const query = parse('vue=liste&tri=nom&page=2')
    expect(withFilter(query, { exposures: ['soleil'] })).toEqual({
      ...query,
      exposures: ['soleil'],
      page: 1,
    })
  })
})

describe('variantes de la liste', () => {
  it('tout effacer garde la vue et retire filtres et tri', () => {
    expect(clearFilters(parse('exposition=soleil&tri=nom&vue=liste'))).toEqual({
      ...DEFAULT_QUERY,
      view: 'liste',
    })
  })

  it('considère comme filtrée toute liste avec filtre, tri ou vue liste', () => {
    expect(isFiltered(parse('page=2'))).toBe(false)
    expect(isFiltered(parse('tri=nom'))).toBe(true)
    expect(isFiltered(parse('vue=liste'))).toBe(true)
    expect(isFiltered(parse('en_stock=1'))).toBe(true)
  })
})
