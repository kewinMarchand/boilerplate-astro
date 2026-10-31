import { parseCatalogQuery } from '../domain/catalogQuery'
import { parseCategorySlugs } from '../domain/categoryPath'
import { findCatalogListing } from '../infrastructure/catalogRepository'
import { CatalogLoadError } from './CatalogLoadError'

import type { Catalog } from '../domain/catalog'

export type CatalogPageLoad =
  { status: 'not-found' } | { status: 'ok'; query: Catalog.Query; result: Catalog.Result }

/**
 * Cas d'utilisation « afficher une page du catalogue » : lit l'état de recherche, interroge le
 * dépôt, puis décide. Catégorie inconnue ou page au-delà de la dernière : introuvable. Échec du
 * dépôt : résultat en erreur, que l'interface affiche avec une relance.
 */
export const loadCatalogPage = async (
  rawSlugs: string | undefined,
  searchParams: URLSearchParams,
): Promise<CatalogPageLoad> => {
  const query = parseCatalogQuery(searchParams)

  let listing: Catalog.Listing | null
  try {
    listing = await findCatalogListing(parseCategorySlugs(rawSlugs), query)
  } catch {
    return {
      status: 'ok',
      query,
      result: { status: 'error', message: new CatalogLoadError().message },
    }
  }

  if (!listing || query.page > listing.totalPages) return { status: 'not-found' }

  return { status: 'ok', query, result: { status: 'success', listing } }
}
