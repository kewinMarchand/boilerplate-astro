import { buildSitemapXml } from '@/shared/seo'

import { listCatalogPaths } from '@/modules/catalog/index.server'

import type { APIRoute } from 'astro'

export const GET: APIRoute = async () =>
  new Response(buildSitemapXml(await listCatalogPaths()), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
