import { ApiError, createApiClient, serverApiScenario, serverApiUrl } from '@/shared/api/client'

import { toTask } from './http/taskTranslation'

import type { Task } from '../domain/task'

/** Adresse de l'API, lue sur le serveur et passée à l'îlot qui charge les tâches. */
export const tasksApiUrl = serverApiUrl

/** Scénario de l'API fixé pour le site, lu sur le serveur et passé à l'îlot. */
export const tasksApiScenario = serverApiScenario

/** Appelée dans le navigateur, par l'îlot de la page Tâches ; `locale` sur un site multilingue seulement. */
export const findAllTasks = async ({
  apiUrl,
  locale,
  scenario,
}: {
  apiUrl: string
  locale?: string | undefined
  scenario?: string | undefined
}): Promise<Task.Entity[]> => {
  const { data, response } = await createApiClient(fetch, scenario, apiUrl, locale).GET(
    '/api/tasks',
  )
  if (!data) throw new ApiError(response)
  return data.map(toTask)
}
