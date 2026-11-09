import {
  categoryAlternates,
  categoryHref,
  categoryTrail,
  listCategoryAlternates,
  parseCategorySlugs,
  resolveCategoryPath,
  toCategoryMenu,
} from './categoryPath'

import type { Catalog } from './catalog'

const node = (
  slug: string,
  children: Catalog.Category[] = [],
  alternates: Catalog.SlugAlternate[] = [],
): Catalog.Category => ({
  slug,
  name: slug.toUpperCase(),
  description: '',
  children,
  alternates,
})

const MONOLINGUAL: Catalog.Languages = { locale: 'fr', locales: ['fr'] }

const TREE = [
  node('a', [node('a1', [node('a1x', [node('a1x9')]), node('a1y')]), node('a2')]),
  node('b'),
]

describe('chemin de catégorie', () => {
  it('lit les slugs du paramètre de route', () => {
    expect(parseCategorySlugs(undefined)).toEqual([])
    expect(parseCategorySlugs('a/a1/')).toEqual(['a', 'a1'])
  })

  it('construit l’URL d’une catégorie', () => {
    expect(categoryHref([])).toBe('/catalogue')
    expect(categoryHref(['a', 'a1'])).toBe('/catalogue/a/a1')
  })

  it('résout un chemin connu en chaîne de liens', () => {
    expect(resolveCategoryPath(TREE, ['a', 'a1'])).toEqual([
      { slug: 'a', name: 'A', path: '/catalogue/a' },
      { slug: 'a1', name: 'A1', path: '/catalogue/a/a1' },
    ])
    expect(resolveCategoryPath(TREE, [])).toEqual([])
  })

  it('rejette un slug inconnu ou un chemin trop profond', () => {
    expect(resolveCategoryPath(TREE, ['a', 'zz'])).toBeNull()
    expect(resolveCategoryPath(TREE, ['a', 'a1', 'a1x', 'a1x9'])).toBeNull()
  })

  it('donne la piste du fil d’Ariane sans la catégorie courante', () => {
    const path = resolveCategoryPath(TREE, ['a', 'a1', 'a1x']) ?? []
    expect(categoryTrail(path)).toEqual([
      { label: 'A', path: '/catalogue/a' },
      { label: 'A1', path: '/catalogue/a/a1' },
    ])
  })

  it('liste les chemins de toutes les catégories et construit le menu', () => {
    expect(listCategoryAlternates([node('a', [node('a1')]), node('b')], MONOLINGUAL)).toEqual([
      [{ locale: 'fr', path: '/catalogue/a' }],
      [{ locale: 'fr', path: '/catalogue/a/a1' }],
      [{ locale: 'fr', path: '/catalogue/b' }],
    ])
    expect(toCategoryMenu([node('a', [node('a1')])])).toEqual([
      {
        id: 'a',
        label: 'A',
        path: '/catalogue/a',
        children: [{ id: 'a1', label: 'A1', path: '/catalogue/a/a1', children: [] }],
      },
    ])
  })

  it('donne la page d’une catégorie dans chaque langue où toute sa chaîne existe', () => {
    const plants = node(
      'plantes',
      [],
      [
        { locale: 'fr', slug: 'plantes' },
        { locale: 'en', slug: 'plants' },
      ],
    )
    const ferns = node('fougeres', [], [{ locale: 'fr', slug: 'fougeres' }])
    const bilingual = { locale: 'fr', locales: ['fr', 'en'] }

    expect(categoryAlternates([plants], bilingual)).toEqual([
      { locale: 'fr', path: '/catalogue/plantes' },
      { locale: 'en', path: '/catalogue/plants' },
    ])
    expect(categoryAlternates([plants, ferns], bilingual)).toEqual([
      { locale: 'fr', path: '/catalogue/plantes/fougeres' },
    ])
    expect(categoryAlternates([], bilingual)).toEqual([
      { locale: 'fr', path: '/catalogue' },
      { locale: 'en', path: '/catalogue' },
    ])
  })
})
