import { buildWebManifest } from '@/shared/seo'

import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ locals }) =>
  new Response(buildWebManifest(locals.siteIdentity, locals.locale.locale), {
    headers: { 'content-type': 'application/manifest+json' },
  })
