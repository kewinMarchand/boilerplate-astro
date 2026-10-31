import { buildSitemapXml } from '@/shared/seo'

import type { APIRoute } from 'astro'

export const GET: APIRoute = () =>
  new Response(buildSitemapXml(), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  })
