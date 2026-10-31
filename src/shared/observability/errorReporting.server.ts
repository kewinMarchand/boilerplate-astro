import { errorReportingConfig, glitchtipOptions } from './errorReporting'

import type * as Sentry from '@sentry/astro'

let sentry: Promise<typeof Sentry | null> | null = null

/** Charge le SDK serveur une seule fois, et seulement si un DSN est fourni : sinon rien n'est importé. */
const serverSentry = () =>
  (sentry ??= (async () => {
    const config = errorReportingConfig(
      process.env['PUBLIC_GLITCHTIP_DSN'],
      process.env['PUBLIC_GLITCHTIP_ENVIRONMENT'],
      import.meta.env.DEV,
    )
    if (!config) return null
    const sdk = await import('@sentry/astro')
    sdk.init({ ...glitchtipOptions(config) })
    return sdk
  })())

export const reportServerError = async (error: unknown) => {
  const sdk = await serverSentry()
  if (!sdk) return
  sdk.captureException(error)
  await sdk.flush(2000)
}
