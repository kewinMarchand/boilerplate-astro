import { buildSitemapXml } from '@/shared/seo'

import { listArticlePaths } from '@/modules/blog/index.server'
import { listCatalogPaths } from '@/modules/catalog/index.server'

import type { APIRoute } from 'astro'

export const GET: APIRoute = async () =>
  new Response(buildSitemapXml([...(await listCatalogPaths()), ...(await listArticlePaths())]), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
