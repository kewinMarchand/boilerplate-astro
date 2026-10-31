import { errorReportingConfig } from './errorReporting'
import { matomoConfig } from './matomo'

import type { ObservabilityConfig } from './config'

export const observabilityConfig = (): ObservabilityConfig => ({
  glitchtip: errorReportingConfig(
    process.env['PUBLIC_GLITCHTIP_DSN'],
    process.env['PUBLIC_GLITCHTIP_ENVIRONMENT'],
    import.meta.env.DEV,
  ),
  matomo: matomoConfig(process.env['PUBLIC_MATOMO_URL'], process.env['PUBLIC_MATOMO_SITE_ID']),
})

export const isAudienceMeasurementEnabled = () => observabilityConfig().matomo !== null
