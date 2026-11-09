import {
  toCategory,
  toFacetsQuery,
  toListing,
  toProductDetail,
  toProductsQuery,
} from './catalogTranslation'

import type { Catalog } from '@/modules/catalog/domain/catalog'

const QUERY: Catalog.Query = {
  exposures: [],
  sizes: [],
  priceMin: undefined,
  priceMax: undefined,
  inStock: false,
  attributes: {},
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

  it('traduit les attributs cochés en attributes[<code>][], sans attribut vide', () => {
    expect(
      toProductsQuery([], {
        ...QUERY,
        attributes: { feuillage: ['persistant', 'caduc'], couleur: [] },
      }),
    ).toEqual({ attributes: { feuillage: ['persistant', 'caduc'] }, page: 1, itemsPerPage: 12 })
  })
})

describe('toFacetsQuery', () => {
  it('garde les filtres, sans tri ni pagination', () => {
    expect(
      toFacetsQuery(['plantes-interieur'], { ...QUERY, sizes: ['S'], sort: 'nom', page: 3 }),
    ).toEqual({ category: 'plantes-interieur', 'size[]': ['S'] })
  })
})

describe('toCategory', () => {
  it('ajoute la description éditoriale du site à chaque catégorie', () => {
    const category = toCategory(
      {
        slug: 'plantes-aquatiques',
        name: 'Plantes aquatiques',
        parent: null,
        alternates: [],
        children: [
          {
            slug: 'nenuphars',
            name: 'Nénuphars',
            parent: 'plantes-aquatiques',
            alternates: [],
            children: [],
          },
        ],
      },
      'fr',
    )

    expect(category.description).toMatch(/^Plantes aquatiques pour bassins/)
    expect(category.children[0]?.description).toMatch(/^Nénuphars blancs/)
  })
})

const CONTEXT = {
  categories: [],
  languages: { locale: 'fr', locales: ['fr'] },
  language: 'fr',
}

describe('toListing', () => {
  it('traduit identifiants, prix, sous-catégories et facettes dans l’ordre du domaine', () => {
    const listing = toListing(
      [
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
          attributes: [],
        },
      ],
      {
        totalItems: 1,
        exposure: [
          { value: 'ombre', count: 0 },
          { value: 'mi-ombre', count: 1 },
        ],
        size: [{ value: 'L', count: 1 }],
        category: [{ slug: 'palmiers', name: 'Palmiers', count: 1 }],
        attributes: [
          {
            code: 'feuillage',
            label: 'Feuillage',
            values: [
              { value: 'persistant', label: 'Persistant', count: 1 },
              { value: 'caduc', label: 'Caduc', count: 0 },
            ],
          },
        ],
      },
      1,
      { chain: [], slugs: ['plantes-exterieur'], ...CONTEXT },
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
    expect(listing.facets.attributes).toEqual([
      {
        code: 'feuillage',
        label: 'Feuillage',
        values: [
          { value: 'persistant', label: 'Persistant', count: 1 },
          { value: 'caduc', label: 'Caduc', count: 0 },
        ],
      },
    ])
  })

  it('garde au moins une page quand il n’y a aucun résultat', () => {
    const listing = toListing(
      [],
      { totalItems: 0, exposure: [], size: [], category: [], attributes: [] },
      1,
      { chain: [], slugs: [], ...CONTEXT },
    )

    expect(listing.totalPages).toBe(1)
  })

  it('calcule le nombre de pages à partir du total des facettes', () => {
    const listing = toListing(
      [],
      { totalItems: 25, exposure: [], size: [], category: [], attributes: [] },
      3,
      { chain: [], slugs: [], ...CONTEXT },
    )

    expect(listing).toMatchObject({ total: 25, page: 3, totalPages: 3 })
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
    attributes: [],
    gallery: [],
    metaTitle: '',
    metaDescription: '',
    alternates: [],
  }

  it('découpe la description en paragraphes aux lignes vides', () => {
    const detail = toProductDetail({
      ...DTO,
      description: 'Rustique.\n\n  \nRésiste au vent,\naux embruns.',
    })

    expect(detail.description).toEqual(['Rustique.', 'Résiste au vent,\naux embruns.'])
  })

  it('garde le libellé de la valeur et l’unité de chaque attribut, dans l’ordre', () => {
    const detail = toProductDetail({
      ...DTO,
      description: '',
      attributes: [
        {
          code: 'feuillage',
          label: 'Feuillage',
          type: 'choice',
          value: 'persistant',
          valueLabel: 'Persistant',
          unit: null,
        },
        {
          code: 'hauteur-adulte',
          label: 'Hauteur adulte',
          type: 'number',
          value: '180',
          valueLabel: '180',
          unit: 'cm',
        },
      ],
    })

    expect(detail.attributes).toEqual([
      { code: 'feuillage', label: 'Feuillage', value: 'Persistant', unit: null },
      { code: 'hauteur-adulte', label: 'Hauteur adulte', value: '180', unit: 'cm' },
    ])
  })

  it('ne garde aucun paragraphe pour une description vide', () => {
    expect(toProductDetail({ ...DTO, description: '' }).description).toEqual([])
  })

  it('garde la galerie dans l’ordre, vide sans image supplémentaire', () => {
    const image = (name: string) => ({
      alt: 'Palmier nain',
      width: 800,
      height: 800,
      sources: [{ type: 'image/webp' as const, srcset: `https://api/${name}-400.webp 400w` }],
      src: `https://api/${name}-400.webp`,
    })
    const gallery = [image('profil'), image('feuille')]

    expect(toProductDetail({ ...DTO, description: '', gallery }).gallery).toEqual(gallery)
    expect(toProductDetail({ ...DTO, description: '' }).gallery).toEqual([])
  })

  it('reprend titre et description saisis, chaînes vides sinon', () => {
    const detail = toProductDetail({
      ...DTO,
      description: '',
      metaTitle: ' Palmier nain d’extérieur ',
      metaDescription: 'Un palmier rustique.',
    })

    expect(detail).toMatchObject({
      metaTitle: 'Palmier nain d’extérieur',
      metaDescription: 'Un palmier rustique.',
    })
    expect(toProductDetail({ ...DTO, description: '' })).toMatchObject({
      metaTitle: '',
      metaDescription: '',
    })
  })

  it('donne la fiche produit dans chaque langue où elle existe', () => {
    const detail = toProductDetail({
      ...DTO,
      description: '',
      alternates: [
        { locale: 'fr', slug: 'palmier-nain' },
        { locale: 'en', slug: 'dwarf-palm' },
      ],
    })

    expect(detail.alternates).toEqual([
      { locale: 'fr', path: '/produit/palmier-nain' },
      { locale: 'en', path: '/produit/dwarf-palm' },
    ])
  })
})

describe('langues', () => {
  it('choisit la description éditoriale dans la langue de la réponse, par le slug français', () => {
    const category = toCategory(
      {
        slug: 'aquatic-plants',
        name: 'Aquatic plants',
        parent: null,
        alternates: [
          { locale: 'fr', slug: 'plantes-aquatiques' },
          { locale: 'en', slug: 'aquatic-plants' },
        ],
        children: [],
      },
      'en',
    )

    expect(category.description).toMatch(/^Aquatic plants for ponds/)
  })
})
