import {
  categoryHref,
  categoryTrail,
  listCategoryPaths,
  parseCategorySlugs,
  resolveCategoryPath,
  toCategoryMenu,
} from './categoryPath'

import type { Catalog } from './catalog'

const node = (slug: string, children: Catalog.Category[] = []): Catalog.Category => ({
  slug,
  name: slug.toUpperCase(),
  description: '',
  children,
})

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
    expect(listCategoryPaths([node('a', [node('a1')]), node('b')])).toEqual([
      '/catalogue/a',
      '/catalogue/a/a1',
      '/catalogue/b',
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
})
