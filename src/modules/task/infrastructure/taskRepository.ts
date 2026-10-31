import { ApiError, createApiClient, serverApiUrl } from '@/shared/api/client'

import { toTask } from './http/taskTranslation'

import type { Task } from '../domain/task'

/** Adresse de l'API, lue sur le serveur et passée à l'îlot qui charge les tâches. */
export const tasksApiUrl = serverApiUrl

/** Appelée dans le navigateur, par l'îlot de la page Tâches. */
export const findAllTasks = async (apiUrl: string): Promise<Task.Entity[]> => {
  const { data, response } = await createApiClient(fetch, null, apiUrl).GET('/api/tasks')
  if (!data) throw new ApiError(response)
  return data.map(toTask)
}
