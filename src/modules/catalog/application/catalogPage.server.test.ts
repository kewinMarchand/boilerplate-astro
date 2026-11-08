import { findCatalogListing } from '../infrastructure/catalogRepository'
import { loadCatalogPage } from './catalogPage.server'

import type { Catalog } from '../domain/catalog'

vi.mock('../infrastructure/catalogRepository', () => ({ findCatalogListing: vi.fn() }))

const params = (search = '') => new URLSearchParams(search)

const LISTING: Catalog.Listing = {
  chain: [
    {
      slug: 'plantes-interieur',
      name: 'Plantes d’intérieur',
      path: '/catalogue/plantes-interieur',
    },
  ],
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

    const page = await loadCatalogPage('plantes-interieur', params('tri=nom'), true)

    expect(findCatalogListing).toHaveBeenCalledWith(
      ['plantes-interieur'],
      expect.objectContaining({ sort: 'nom' }),
    )
    expect(page).toEqual({
      status: 'ok',
      query: expect.objectContaining({ sort: 'nom' }),
      result: { status: 'success', listing: LISTING },
    })
  })

  it('déclare introuvables une catégorie inconnue et une page hors bornes', async () => {
    vi.mocked(findCatalogListing).mockResolvedValueOnce(null)
    expect(await loadCatalogPage('inconnue', params(), true)).toEqual({ status: 'not-found' })

    vi.mocked(findCatalogListing).mockResolvedValueOnce(LISTING)
    expect(await loadCatalogPage(undefined, params('page=9'), true)).toEqual({
      status: 'not-found',
    })
  })

  it('ignore filtre et tri par prix sans vente en ligne', async () => {
    vi.mocked(findCatalogListing).mockResolvedValueOnce(LISTING)

    const page = await loadCatalogPage(
      undefined,
      params('prix_min=10&prix_max=50&tri=prix-asc&taille=M'),
      false,
    )

    const expected = { priceMin: undefined, priceMax: undefined, sort: 'pertinence', sizes: ['M'] }
    expect(findCatalogListing).toHaveBeenCalledWith([], expect.objectContaining(expected))
    expect(page).toMatchObject({ status: 'ok', query: expected })
  })

  it('transforme un échec du dépôt en résultat d’erreur affichable', async () => {
    vi.mocked(findCatalogListing).mockRejectedValueOnce(new Error('panne'))

    const page = await loadCatalogPage(undefined, params(), true)

    expect(page).toEqual({
      status: 'ok',
      query: expect.objectContaining({ page: 1 }),
      result: { status: 'error', message: 'Impossible de charger le catalogue pour le moment.' },
    })
  })
})
