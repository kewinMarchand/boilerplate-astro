import type { Catalog } from './catalog'

export const findCategoryChain = (
  tree: Catalog.Category[],
  slugs: string[],
): Catalog.Category[] | null => {
  const chain: Catalog.Category[] = []
  let level = tree
  for (const slug of slugs) {
    const category = level.find((candidate) => candidate.slug === slug)
    if (!category) return null
    chain.push(category)
    level = category.children
  }
  return chain
}

export const collectLeafSlugs = (category: Catalog.Category): string[] =>
  category.children.length === 0
    ? [category.slug]
    : category.children.flatMap((child) => collectLeafSlugs(child))
