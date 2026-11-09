import { AsyncLocalStorage } from 'node:async_hooks'

import { createApiClient, serverApiScenario, serverApiUrl } from './client'

// X-Scenario de la requête en cours (tests e2e : états d'erreur et de liste vide), posé par le middleware :
// les dépôts appellent serverApiClient() sans recevoir la requête, comme avec getRequestEvent de SvelteKit.
const requestScenario = new AsyncLocalStorage<string | null>()

export const withRequestScenario = <T>(request: Request, run: () => T): T =>
  requestScenario.run(request.headers.get('X-Scenario'), run)

/** Langue de la page pour l'API, et si le site en a plusieurs. */
interface ApiLanguage {
  locale: string
  multilingual: boolean
}

// Langue de la requête en cours, posée par le middleware une fois les langues du site connues.
const requestLanguage = new AsyncLocalStorage<ApiLanguage>()

export const withRequestLanguage = <T>(language: ApiLanguage, run: () => T): T =>
  requestLanguage.run(language, run)

/** Client de la requête en cours : `X-Scenario` reçu (ou `API_SCENARIO`), `locale` telle quelle. */
export const requestApiClient = (locale?: string) =>
  createApiClient(
    globalThis.fetch,
    requestScenario.getStore() || serverApiScenario(),
    serverApiUrl(),
    locale,
  )

/**
 * Client de la requête en cours, avec la langue de la page sur chaque lecture, ou `locale` (sitemap, qui
 * parcourt chaque langue). Site monolingue : appels inchangés, sans paramètre de langue.
 */
export const serverApiClient = ({ locale }: { locale?: string | undefined } = {}) => {
  const page = requestLanguage.getStore()
  return requestApiClient(page?.multilingual ? (locale ?? page.locale) : undefined)
}
