import { findFeaturedProducts, findProduct } from '../infrastructure/catalogRepository'
import { loadFeaturedProducts, loadProduct } from './products.server'

vi.mock('../infrastructure/catalogRepository', () => ({
  findProduct: vi.fn(),
  findFeaturedProducts: vi.fn(),
  findAllProductSlugs: vi.fn(),
}))

describe('loadProduct', () => {
  it('distingue un produit inconnu d’une API en panne', async () => {
    vi.mocked(findProduct).mockResolvedValueOnce(null)
    expect(await loadProduct('inconnu')).toEqual({ status: 'not-found' })

    vi.mocked(findProduct).mockRejectedValueOnce(new Error('panne'))
    expect(await loadProduct('monstera')).toEqual({
      status: 'error',
      message: 'Impossible de charger ce produit pour le moment.',
    })
  })
})

describe('loadFeaturedProducts', () => {
  it('transforme un échec du dépôt en message d’erreur affichable', async () => {
    vi.mocked(findFeaturedProducts).mockRejectedValueOnce(new Error('panne'))

    expect(await loadFeaturedProducts()).toEqual({
      featured: { status: 'error', message: 'Impossible de charger le carrousel pour le moment.' },
    })
  })
})
