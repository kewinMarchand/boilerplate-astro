import { defineMiddleware } from 'astro:middleware'

import { MAINTENANCE_HTML, MAINTENANCE_RETRY_AFTER_SECONDS } from '@/views/errors'

// MAINTENANCE=1 : toutes les pages répondent 503 avec la page autonome de maintenance.
export const onRequest = defineMiddleware((_context, next) => {
  if (process.env['MAINTENANCE'] === '1') {
    return new Response(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': String(MAINTENANCE_RETRY_AFTER_SECONDS),
      },
    })
  }
  return next()
})
