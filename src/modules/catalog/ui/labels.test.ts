import { fr } from '@/shared/i18n/dictionaries/fr'

import { catalogIslandResult, catalogLabels, splitCatalogSection } from './labels'

import type { Catalog } from '../domain/catalog'

describe('props de l’îlot du catalogue', () => {
  it('ne sérialise aucun texte lu par le serveur seul', () => {
    const { serverOnly } = splitCatalogSection(fr.catalog)
    const serialized = JSON.stringify(catalogLabels(fr))

    for (const text of Object.values(serverOnly)) expect(serialized).not.toContain(text)
    expect(Object.keys(catalogLabels(fr).catalog)).toHaveLength(
      Object.keys(fr.catalog).length - Object.keys(serverOnly).length,
    )
  })

  it('retire de la page la description et les équivalents de la catégorie', () => {
    const listing: Catalog.Listing = {
      chain: [],
      alternates: [{ locale: 'en', path: '/catalogue' }],
      description: 'Description de la catégorie',
      children: [],
      products: [],
      total: 0,
      page: 1,
      totalPages: 1,
      facets: { exposure: [], size: [], attributes: [] },
    }

    expect(catalogIslandResult({ status: 'success', listing })).toEqual({
      status: 'success',
      listing: {
        chain: [],
        children: [],
        products: [],
        total: 0,
        page: 1,
        totalPages: 1,
        facets: listing.facets,
      },
    })
  })
})
