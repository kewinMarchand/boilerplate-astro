import { defineMiddleware } from 'astro:middleware'

import { withRequestScenario } from '@/shared/api/client.server'
import { compressHtml } from '@/shared/http'
import { SCENARIO_HEADER } from '@/shared/observability'
import { reportServerError } from '@/shared/observability/index.server'
import { announceStartup, CSP_HEADER, siteCspHeader } from '@/shared/security/index.server'

import { getCategoryMenu } from '@/modules/catalog/index.server'

import { MAINTENANCE_HTML, MAINTENANCE_RETRY_AFTER_SECONDS } from '@/views/errors'

announceStartup()

// MAINTENANCE=1 : toutes les pages répondent 503 avec la page autonome de maintenance. Sinon, la requête
// porte son X-Scenario jusqu'à l'API, le menu des catégories est chargé une fois pour le header, et la
// réponse reçoit la CSP Report-Only. Seules les erreurs inattendues remontent à GlitchTip.
export const onRequest = defineMiddleware((context, next) => {
  if (process.env['MAINTENANCE'] === '1') {
    return new Response(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': String(MAINTENANCE_RETRY_AFTER_SECONDS),
      },
    })
  }

  if (context.isPrerendered) return next()

  return withRequestScenario(context.request, async () => {
    context.locals.categoryMenu = await getCategoryMenu()
    let response: Response
    try {
      response = await next()
    } catch (error) {
      if (!context.request.headers.get(SCENARIO_HEADER)) await reportServerError(error)
      throw error
    }
    response.headers.set(CSP_HEADER, siteCspHeader())
    return compressHtml(context.request, response)
  })
})
