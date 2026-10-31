import type { ErrorReportingConfig } from './errorReporting'
import type { MatomoConfig } from './matomo'

/**
 * Configuration lue à l'exécution sur le serveur et rendue dans la page (bloc JSON du layout) :
 * activer Matomo ou GlitchTip ne demande pas de reconstruire le site, comme en Symfony et en HTML.
 */
export interface ObservabilityConfig {
  glitchtip: ErrorReportingConfig | null
  matomo: MatomoConfig | null
}

export const OBSERVABILITY_CONFIG_ID = 'observability-config'

export const readObservabilityConfig = (): ObservabilityConfig => {
  const element = document.getElementById(OBSERVABILITY_CONFIG_ID)
  try {
    return element?.textContent
      ? (JSON.parse(element.textContent) as ObservabilityConfig)
      : { glitchtip: null, matomo: null }
  } catch {
    return { glitchtip: null, matomo: null }
  }
}
