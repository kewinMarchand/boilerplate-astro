import createClient from 'openapi-fetch'

import type { paths } from './schema'

export type { components, operations } from './schema'

export const serverApiUrl = () => process.env['API_URL'] ?? 'http://localhost:8090'

/**
 * Client typé de l'API. `X-Scenario` (error, empty) n'a d'effet qu'en dev et en test côté API :
 * le relayer permet aux tests e2e de provoquer les états d'erreur et de liste vide.
 */
export const createApiClient = (
  fetch: typeof globalThis.fetch,
  scenario?: string | null,
  // Lu dans l'environnement du serveur ; un îlot qui appelle l'API depuis le navigateur passe l'adresse.
  baseUrl: string = serverApiUrl(),
) =>
  createClient<paths, 'application/json'>({
    baseUrl,
    fetch,
    headers: scenario ? { 'X-Scenario': scenario } : {},
  })

export class ApiError extends Error {
  constructor(response: Response) {
    super(`Réponse ${response.status} de l'API (${response.url})`)
    this.name = 'ApiError'
  }
}
