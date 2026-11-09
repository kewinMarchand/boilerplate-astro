import { listCategoryAlternates, toCategoryMenu } from '../domain/categoryPath'
import { findCategoryTree } from '../infrastructure/catalogRepository'

import type { Catalog } from '../domain/catalog'

/** Menu des catégories. API indisponible : menu vide, la page reste servie. */
export const getCategoryMenu = async () => {
  try {
    return toCategoryMenu(await findCategoryTree())
  } catch {
    return toCategoryMenu([])
  }
}

/** Chaque catégorie dans chaque langue, pour le sitemap (arbre lu dans la langue de la requête). */
export const listCatalogAlternates = async (languages: Catalog.Languages) =>
  listCategoryAlternates(await findCategoryTree(), languages)
