import { buildRobotsTxt } from '@/shared/seo'

import type { APIRoute } from 'astro'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(buildRobotsTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } })
