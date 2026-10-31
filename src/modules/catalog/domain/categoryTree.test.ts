import { collectLeafSlugs, findCategoryChain } from './categoryTree'

import type { Catalog } from './catalog'

const node = (slug: string, children: Catalog.Category[] = []): Catalog.Category => ({
  slug,
  name: slug,
  description: '',
  children,
})

const TREE = [node('a', [node('a1', [node('a1x'), node('a1y')]), node('a2')]), node('b')]

describe('arbre de catégories', () => {
  it('retrouve la chaîne d’une branche, ou null si un slug est inconnu', () => {
    expect(findCategoryChain(TREE, ['a', 'a1'])?.map((category) => category.slug)).toEqual([
      'a',
      'a1',
    ])
    expect(findCategoryChain(TREE, ['a', 'zz'])).toBeNull()
    expect(findCategoryChain(TREE, [])).toEqual([])
  })

  it('collecte les feuilles d’une branche', () => {
    expect(collectLeafSlugs(TREE[0] ?? node('vide'))).toEqual(['a1x', 'a1y', 'a2'])
  })
})
