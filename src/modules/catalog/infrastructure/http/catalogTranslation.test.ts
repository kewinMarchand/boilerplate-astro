import { toCategory, toListing, toProductDetail, toProductsQuery } from './catalogTranslation'

import type { Catalog } from '@/modules/catalog/domain/catalog'

const QUERY: Catalog.Query = {
  exposures: [],
  sizes: [],
  priceMin: undefined,
  priceMax: undefined,
  inStock: false,
  sort: 'pertinence',
  view: 'grille',
  page: 1,
}

describe('toProductsQuery', () => {
  it('n’envoie que la pagination sans filtre ni tri', () => {
    expect(toProductsQuery([], QUERY)).toEqual({ page: 1, itemsPerPage: 12 })
  })

  it('traduit catégorie, filtres, prix en centimes et tri', () => {
    expect(
      toProductsQuery(['plantes-interieur', 'feuillages'], {
        ...QUERY,
        exposures: ['soleil', 'ombre'],
        sizes: ['M'],
        priceMin: 10,
        priceMax: 49.9,
        inStock: true,
        sort: 'prix-desc',
        page: 2,
      }),
    ).toEqual({
      category: 'feuillages',
      'exposure[]': ['soleil', 'ombre'],
      'size[]': ['M'],
      priceMin: 1000,
      priceMax: 4990,
      inStock: true,
      'order[price]': 'desc',
      page: 2,
      itemsPerPage: 12,
    })
    expect(toProductsQuery([], { ...QUERY, sort: 'nom' })).toMatchObject({ 'order[name]': 'asc' })
  })
})

describe('toCategory', () => {
  it('ajoute la description éditoriale du site à chaque catégorie', () => {
    const category = toCategory({
      slug: 'plantes-aquatiques',
      name: 'Plantes aquatiques',
      parent: null,
      children: [
        { slug: 'nenuphars', name: 'Nénuphars', parent: 'plantes-aquatiques', children: [] },
      ],
    })

    expect(category.description).toMatch(/^Plantes aquatiques pour bassins/)
    expect(category.children[0]?.description).toMatch(/^Nénuphars blancs/)
  })
})

describe('toListing', () => {
  it('traduit identifiants, prix, sous-catégories et facettes dans l’ordre du domaine', () => {
    const listing = toListing(
      {
        items: [
          {
            id: 7,
            slug: 'kentia',
            name: 'Kentia',
            categorySlug: 'palmiers',
            price: 5990,
            exposure: 'mi-ombre',
            size: 'L',
            inStock: true,
            image: null,
          },
        ],
        totalItems: 1,
        page: 1,
        itemsPerPage: 12,
        totalPages: 1,
        facets: {
          exposure: [
            { value: 'ombre', count: 0 },
            { value: 'mi-ombre', count: 1 },
          ],
          size: [{ value: 'L', count: 1 }],
          category: [{ slug: 'palmiers', name: 'Palmiers', count: 1 }],
        },
      },
      { chain: [], slugs: ['plantes-exterieur'] },
    )

    expect(listing.products[0]).toMatchObject({ id: '7', price: 5990 })
    expect(listing.children).toEqual([
      {
        slug: 'palmiers',
        name: 'Palmiers',
        path: '/catalogue/plantes-exterieur/palmiers',
        count: 1,
      },
    ])
    expect(listing.facets.exposure).toEqual([
      { value: 'soleil', count: 0 },
      { value: 'mi-ombre', count: 1 },
      { value: 'ombre', count: 0 },
    ])
  })

  it('garde au moins une page quand il n’y a aucun résultat', () => {
    const listing = toListing(
      {
        items: [],
        totalItems: 0,
        page: 1,
        itemsPerPage: 12,
        totalPages: 0,
        facets: { exposure: [], size: [], category: [] },
      },
      { chain: [], slugs: [] },
    )

    expect(listing.totalPages).toBe(1)
  })
})

describe('toProductDetail', () => {
  const DTO = {
    id: 1,
    slug: 'palmier-nain',
    name: 'Palmier nain',
    categorySlug: 'palmiers',
    price: 4490,
    exposure: 'soleil' as const,
    size: 'M' as const,
    inStock: true,
    image: null,
    categoryPath: [{ slug: 'palmiers', name: 'Palmiers' }],
  }

  it('découpe la description en paragraphes aux lignes vides', () => {
    const detail = toProductDetail({
      ...DTO,
      description: 'Rustique.\n\n  \nRésiste au vent,\naux embruns.',
    })

    expect(detail.description).toEqual(['Rustique.', 'Résiste au vent,\naux embruns.'])
  })

  it('ne garde aucun paragraphe pour une description vide', () => {
    expect(toProductDetail({ ...DTO, description: '' }).description).toEqual([])
  })
})
