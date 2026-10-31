import { findCategoryChain } from './categoryTree'

import type { Catalog } from './catalog'
import type { NavigationNode } from '@/shared/config'
import type { AppPath } from '@/shared/routing'

export const CATALOG_ROOT_PATH = '/catalogue' as const
export const MAX_CATEGORY_DEPTH = 3

export const parseCategorySlugs = (raw: string | undefined): string[] =>
  (raw ?? '').split('/').filter(Boolean)

export const categoryHref = (slugs: string[]): AppPath =>
  slugs.length > 0 ? `${CATALOG_ROOT_PATH}/${slugs.join('/')}` : CATALOG_ROOT_PATH

export const resolveCategoryPath = (
  tree: Catalog.Category[],
  slugs: string[],
): Catalog.CategoryPath | null => {
  if (slugs.length > MAX_CATEGORY_DEPTH) return null
  const chain = findCategoryChain(tree, slugs)
  return (
    chain?.map((category, index) => ({
      slug: category.slug,
      name: category.name,
      path: categoryHref(slugs.slice(0, index + 1)),
    })) ?? null
  )
}

export const categoryTrail = (path: Catalog.CategoryPath) =>
  path.slice(0, -1).map((link) => ({ label: link.name, path: link.path }))

export const listCategoryPaths = (tree: Catalog.Category[], parents: string[] = []): AppPath[] =>
  tree.flatMap((category) => {
    const slugs = [...parents, category.slug]
    return [categoryHref(slugs), ...listCategoryPaths(category.children, slugs)]
  })

export const toCategoryMenu = (
  tree: Catalog.Category[],
  parents: string[] = [],
): NavigationNode[] =>
  tree.map((category) => {
    const slugs = [...parents, category.slug]
    return {
      id: category.slug,
      label: category.name,
      path: categoryHref(slugs),
      children: toCategoryMenu(category.children, slugs),
    }
  })
