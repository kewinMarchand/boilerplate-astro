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

/**
 * Page d'une chaîne de catégories (racine d'abord) dans chaque langue où chacune a un slug : le sien dans la
 * langue de la page, celui de `alternates` dans les autres. Chaîne vide : la racine du catalogue partout.
 */
export const categoryAlternates = (
  chain: Catalog.Category[],
  { locale, locales }: Catalog.Languages,
): Catalog.Alternate[] =>
  locales.flatMap((target) => {
    const slugs = chain.map((category) =>
      target === locale
        ? category.slug
        : category.alternates.find((alternate) => alternate.locale === target)?.slug,
    )
    return slugs.every((slug): slug is string => slug !== undefined)
      ? [{ locale: target, path: categoryHref(slugs) }]
      : []
  })

/** Chaque catégorie de l'arbre dans chaque langue (sitemap). */
export const listCategoryAlternates = (
  tree: Catalog.Category[],
  languages: Catalog.Languages,
  parents: Catalog.Category[] = [],
): Catalog.Alternate[][] =>
  tree.flatMap((category) => {
    const chain = [...parents, category]
    return [
      categoryAlternates(chain, languages),
      ...listCategoryAlternates(category.children, languages, chain),
    ]
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
