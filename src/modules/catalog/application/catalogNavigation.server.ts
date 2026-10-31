import { listCategoryPaths, toCategoryMenu } from '../domain/categoryPath'
import { findCategoryTree } from '../infrastructure/catalogRepository'

/** Menu des catégories. API indisponible : menu vide, la page reste servie. */
export const getCategoryMenu = async () => {
  try {
    return toCategoryMenu(await findCategoryTree())
  } catch {
    return toCategoryMenu([])
  }
}

export const listCatalogPaths = async () => listCategoryPaths(await findCategoryTree())
