import createClient, { createQuerySerializer } from 'openapi-fetch'

import type { paths } from './schema'
import type { Middleware } from 'openapi-fetch'

export type { components, operations } from './schema'

const serializeDefault = createQuerySerializer()

const isArrayRecord = (value: unknown): value is Record<string, unknown[]> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(Array.isArray)

/** Objet de tableaux en `nom[clé][]` (filtre `attributes[<code>][]`), que le sérialiseur d'openapi-fetch refuse. */
const serializeQuery = (query: Record<string, unknown>) =>
  serializeDefault(
    Object.fromEntries(
      Object.entries(query).flatMap(([name, value]) =>
        isArrayRecord(value)
          ? Object.entries(value).map(([key, items]) => [`${name}[${key}][]`, items])
          : [[name, value]],
      ),
    ),
  )

export const serverApiUrl = () => process.env['API_URL'] ?? 'http://localhost:8090'

/** Scénario fixé pour tout le site (`API_SCENARIO`, `bilingual` pour le site bilingue de test), lu sur le serveur. */
export const serverApiScenario = () => process.env['API_SCENARIO'] || undefined

/**
 * Client typé de l'API. `X-Scenario` (error, empty) n'a d'effet qu'en dev et en test côté API :
 * le relayer permet aux tests e2e de provoquer les états d'erreur et de liste vide.
 */
export const createApiClient = (
  fetch: typeof globalThis.fetch,
  scenario?: string | null,
  // Lu dans l'environnement du serveur ; un îlot qui appelle l'API depuis le navigateur passe l'adresse.
  baseUrl: string = serverApiUrl(),
  // Langue de la page en paramètre de chaque lecture (clé de cache explicite, section 29 bis) ; aucune sur
  // un site monolingue, dont les appels restent inchangés.
  locale?: string,
) => {
  const client = createClient<paths, 'application/json'>({
    baseUrl,
    fetch,
    querySerializer: serializeQuery,
    headers: scenario ? { 'X-Scenario': scenario } : {},
  })
  if (locale) client.use(localeParameter(locale))
  return client
}

const localeParameter = (locale: string): Middleware => ({
  onRequest: ({ request }) => {
    if (request.method !== 'GET') return undefined
    const url = new URL(request.url)
    url.searchParams.set('locale', locale)
    return new Request(url, request)
  },
})

export class ApiError extends Error {
  constructor(response: Response) {
    super(`Réponse ${response.status} de l'API (${response.url})`)
    this.name = 'ApiError'
  }
}
