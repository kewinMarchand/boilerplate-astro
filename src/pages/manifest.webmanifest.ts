import { buildWebManifest } from '@/shared/seo'

import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ locals }) =>
  new Response(buildWebManifest(locals.siteIdentity), {
    headers: { 'content-type': 'application/manifest+json' },
  })
