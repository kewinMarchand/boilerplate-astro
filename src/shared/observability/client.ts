import { readObservabilityConfig } from './config'
import { startClientErrorReporting } from './errorReporting.client'
import { startMatomo } from './matomo.client'

/** Lancé par le layout sur chaque page : rien ne se charge sans variable renseignée. */
export const startObservability = () => {
  const config = readObservabilityConfig()
  startClientErrorReporting(config.glitchtip)
  startMatomo(config.matomo)
}
