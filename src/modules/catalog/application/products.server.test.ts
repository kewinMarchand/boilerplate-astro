import { Price } from '../domain/price'
import { findFeaturedProducts, findProduct } from '../infrastructure/catalogRepository'
import {
  loadFeaturedProducts,
  loadProduct,
  loadProductLink,
  loadProductTranslations,
} from './products.server'

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

const PRODUCT: Catalog.ProductDetail = {
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
  alternates: [],
}

describe('loadProductLink', () => {
  it('nomme le produit trouvé et le lie à sa fiche', async () => {
    vi.mocked(findProduct).mockResolvedValueOnce(PRODUCT)

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

describe('loadProductTranslations', () => {
  it('ne lit rien sur un site monolingue', async () => {
    vi.mocked(findProduct).mockClear()

    expect(await loadProductTranslations(PRODUCT, 'fr')).toEqual([])
    expect(findProduct).not.toHaveBeenCalled()
  })

  it('lit la fiche dans chaque autre langue, et omet une langue que l’API ne sert pas', async () => {
    const bilingual: Catalog.ProductDetail = {
      ...PRODUCT,
      alternates: [
        { locale: 'fr', path: '/produit/monstera-deliciosa' },
        { locale: 'en', path: '/produit/swiss-cheese-plant' },
        { locale: 'de', path: '/produit/fensterblatt' },
      ],
    }
    vi.mocked(findProduct).mockClear()
    vi.mocked(findProduct)
      .mockResolvedValueOnce({ ...PRODUCT, slug: 'swiss-cheese-plant', name: 'Swiss cheese plant' })
      .mockRejectedValueOnce(new Error('panne'))

    expect(await loadProductTranslations(bilingual, 'fr')).toEqual([
      { locale: 'fr', slug: 'monstera-deliciosa', name: 'Monstera deliciosa' },
      { locale: 'en', slug: 'swiss-cheese-plant', name: 'Swiss cheese plant' },
    ])
    expect(findProduct).toHaveBeenCalledWith('swiss-cheese-plant', 'en')
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
