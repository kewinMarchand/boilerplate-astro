export interface ErrorReportingConfig {
  dsn: string
  environment: string
}

export const SCENARIO_HEADER = 'x-scenario'

/** Sans DSN, le suivi des erreurs est éteint : aucun SDK chargé, aucune requête. */
export const errorReportingConfig = (
  dsn: string | undefined,
  environment: string | undefined,
  dev: boolean,
): ErrorReportingConfig | null =>
  dsn ? { dsn, environment: environment ?? (dev ? 'development' : 'production') } : null

/**
 * Seules les erreurs inattendues remontent. Les 404 (kind « framework »), les erreurs voulues
 * (`error()`, kind « app »), la maintenance (une réponse, pas une erreur) et les scénarios de test
 * (en-tête X-Scenario) restent locaux.
 */
export const shouldReportError = ({
  kind,
  scenario,
}: {
  kind: string | undefined
  scenario: string | null
}) => kind === 'unknown' && !scenario

/** Aucune donnée personnelle, aucune trace de performance, aucun rejeu de session. */
export const glitchtipOptions = ({ dsn, environment }: ErrorReportingConfig) => ({
  dsn,
  environment,
  sendDefaultPii: false,
  tracesSampleRate: 0,
})
