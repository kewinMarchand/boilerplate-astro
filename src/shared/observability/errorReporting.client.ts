import { glitchtipOptions } from './errorReporting'

import type { ErrorReportingConfig } from './errorReporting'

const EXCLUDED_INTEGRATIONS = new Set(['BrowserTracing', 'BrowserSession', 'Replay'])

const afterDisplay = (task: () => void) => {
  const schedule = () =>
    'requestIdleCallback' in window ? window.requestIdleCallback(task) : setTimeout(task, 0)
  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
}

/**
 * Le SDK navigateur se charge après l'affichage, et seulement si un DSN est fourni. Les erreurs
 * survenues avant son chargement sont gardées puis envoyées.
 */
export const startClientErrorReporting = (config: ErrorReportingConfig | null) => {
  if (!config) return
  const pending: unknown[] = []
  let capture: ((error: unknown) => void) | null = null
  const report = (error: unknown) => (capture ? capture(error) : pending.push(error))

  window.addEventListener('error', (event) => report(event.error ?? event.message))
  window.addEventListener('unhandledrejection', (event) => report(event.reason))

  afterDisplay(async () => {
    const { captureException, init } = await import('@sentry/astro')
    init({
      ...glitchtipOptions(config),
      integrations: (defaults) =>
        defaults.filter((integration) => !EXCLUDED_INTEGRATIONS.has(integration.name)),
    })
    capture = (error) => captureException(error)
    pending.splice(0).forEach(capture)
  })
}
