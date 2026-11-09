import type { Catalog } from '../domain/catalog'
import type { Dictionary } from '@/shared/i18n'

/**
 * Section du catalogue en deux : les textes que seul le serveur lit (description de la page, carrousel de
 * l'accueil) et les libellés que l'îlot affiche, les seuls sérialisés dans la page.
 */
export const splitCatalogSection = ({
  description,
  featured,
  featuredError,
  ...island
}: Dictionary['catalog']) => ({ serverOnly: { description, featured, featuredError }, island })

/** Libellés de l'îlot du catalogue, dans la langue de la page : sa partie du dictionnaire, pas davantage. */
export type CatalogLabels = Pick<Dictionary, 'language'> & {
  catalog: ReturnType<typeof splitCatalogSection>['island']
  close: string
  ui: Pick<Dictionary['ui'], 'removeFilter'> & {
    alert: Pick<Dictionary['ui']['alert'], 'info' | 'error'>
  }
}

export const catalogLabels = (dictionary: Dictionary): CatalogLabels => ({
  catalog: splitCatalogSection(dictionary.catalog).island,
  language: dictionary.language,
  close: dictionary.layout.close,
  ui: {
    removeFilter: dictionary.ui.removeFilter,
    alert: { info: dictionary.ui.alert.info, error: dictionary.ui.alert.error },
  },
})

/** Page de l'îlot : sans la description ni les équivalents de la catégorie, lus par le serveur seul (métadonnées, sélecteur de langue). */
export type CatalogIslandListing = Omit<Catalog.Listing, 'alternates' | 'description'>

export type CatalogIslandResult =
  | { status: 'success'; listing: CatalogIslandListing }
  | Extract<Catalog.Result, { status: 'error' }>

export const catalogIslandResult = (result: Catalog.Result): CatalogIslandResult => {
  if (result.status === 'error') return result
  const { chain, children, products, total, page, totalPages, facets } = result.listing
  return {
    status: 'success',
    listing: { chain, children, products, total, page, totalPages, facets },
  }
}
