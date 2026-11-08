import { Price } from '../domain/price'
import { findFeaturedProducts, findProduct } from '../infrastructure/catalogRepository'
import { loadFeaturedProducts, loadProduct, loadProductLink } from './products.server'

import type { Catalog } from '../domain/catalog'

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

describe('loadProductLink', () => {
  it('nomme le produit trouvé et le lie à sa fiche', async () => {
    const product: Catalog.ProductDetail = {
      id: '1',
      slug: 'monstera-deliciosa',
      name: 'Monstera deliciosa',
      categorySlug: 'monstera',
      price: Price.fromCents(3490),
      exposure: 'mi-ombre',
      size: 'M',
      inStock: true,
      image: null,
      categoryPath: [],
      description: [],
      attributes: [],
      gallery: [],
      metaTitle: '',
      metaDescription: '',
    }
    vi.mocked(findProduct).mockResolvedValueOnce(product)

    expect(await loadProductLink('monstera-deliciosa')).toEqual({
      slug: 'monstera-deliciosa',
      name: 'Monstera deliciosa',
      path: '/produit/monstera-deliciosa',
    })
  })

  it('ne renvoie rien sans slug, pour un slug inconnu ou une API en panne', async () => {
    vi.mocked(findProduct).mockClear()
    expect(await loadProductLink(null)).toBeNull()
    expect(findProduct).not.toHaveBeenCalled()

    vi.mocked(findProduct).mockResolvedValueOnce(null)
    expect(await loadProductLink('inconnu')).toBeNull()

    vi.mocked(findProduct).mockRejectedValueOnce(new Error('panne'))
    expect(await loadProductLink('monstera')).toBeNull()
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
