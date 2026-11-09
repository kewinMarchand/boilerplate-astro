import { findCatalogListing } from '../infrastructure/catalogRepository'
import { loadCatalogPage } from './catalogPage.server'

import type { Catalog } from '../domain/catalog'

vi.mock('../infrastructure/catalogRepository', () => ({ findCatalogListing: vi.fn() }))

const params = (search = '') => new URLSearchParams(search)
const LANGUAGES: Catalog.Languages = { locale: 'fr', locales: ['fr', 'en'] }
const ALTERNATES: Catalog.Alternate[] = [
  { locale: 'fr', path: '/catalogue/plantes-interieur' },
  { locale: 'en', path: '/catalogue/indoor-plants' },
]

const LISTING: Catalog.Listing = {
  chain: [
    {
      slug: 'plantes-interieur',
      name: 'Plantes d’intérieur',
      path: '/catalogue/plantes-interieur',
    },
  ],
  alternates: ALTERNATES,
  description: 'Plantes tropicales d’intérieur.',
  children: [],
  products: [],
  total: 0,
  page: 1,
  totalPages: 1,
  facets: { exposure: [], size: [], attributes: [] },
}

describe('loadCatalogPage', () => {
  it('renvoie la page d’une catégorie connue, avec l’état de recherche lu dans l’URL', async () => {
    vi.mocked(findCatalogListing).mockResolvedValueOnce(LISTING)

    const page = await loadCatalogPage('plantes-interieur', params('tri=nom'), true, LANGUAGES)

    expect(findCatalogListing).toHaveBeenCalledWith(
      ['plantes-interieur'],
      expect.objectContaining({ sort: 'nom' }),
      LANGUAGES,
    )
    expect(page).toEqual({
      status: 'ok',
      query: expect.objectContaining({ sort: 'nom' }),
      result: { status: 'success', listing: LISTING },
      alternates: ALTERNATES,
    })
  })

  it('déclare introuvables une catégorie inconnue et une page hors bornes', async () => {
    vi.mocked(findCatalogListing).mockResolvedValueOnce(null)
    expect(await loadCatalogPage('inconnue', params(), true, LANGUAGES)).toEqual({
      status: 'not-found',
    })

    vi.mocked(findCatalogListing).mockResolvedValueOnce(LISTING)
    expect(await loadCatalogPage(undefined, params('page=9'), true, LANGUAGES)).toEqual({
      status: 'not-found',
    })
  })

  it('ignore filtre et tri par prix sans vente en ligne', async () => {
    vi.mocked(findCatalogListing).mockResolvedValueOnce(LISTING)

    const page = await loadCatalogPage(
      undefined,
      params('prix_min=10&prix_max=50&tri=prix-asc&taille=M'),
      false,
      LANGUAGES,
    )

    const expected = { priceMin: undefined, priceMax: undefined, sort: 'pertinence', sizes: ['M'] }
    expect(findCatalogListing).toHaveBeenCalledWith(
      [],
      expect.objectContaining(expected),
      LANGUAGES,
    )
    expect(page).toMatchObject({ status: 'ok', query: expected })
  })

  it('transforme un échec du dépôt en résultat d’erreur affichable', async () => {
    vi.mocked(findCatalogListing).mockRejectedValueOnce(new Error('panne'))

    const page = await loadCatalogPage(undefined, params(), true, LANGUAGES)

    expect(page).toEqual({
      status: 'ok',
      query: expect.objectContaining({ page: 1 }),
      result: { status: 'error', message: 'Impossible de charger le catalogue pour le moment.' },
      alternates: undefined,
    })
  })
})
