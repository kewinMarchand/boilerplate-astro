import { AsyncLocalStorage } from 'node:async_hooks'

import { createApiClient } from './client'

// X-Scenario de la requête en cours (tests e2e : états d'erreur et de liste vide), posé par le middleware :
// les dépôts appellent serverApiClient() sans recevoir la requête, comme avec getRequestEvent de SvelteKit.
const requestScenario = new AsyncLocalStorage<string | null>()

export const withRequestScenario = <T>(request: Request, run: () => T): T =>
  requestScenario.run(request.headers.get('X-Scenario'), run)

export const serverApiClient = () => createApiClient(globalThis.fetch, requestScenario.getStore())
