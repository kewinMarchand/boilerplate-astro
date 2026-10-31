import { onMount } from 'svelte'

import { findAllTasks } from '@/modules/task/infrastructure/taskRepository'
import { TasksLoadError } from '@/modules/task/infrastructure/TasksLoadError'

import type { Task } from '@/modules/task/domain/task'

/** Chargement des tâches dans le navigateur : chargement, erreur avec relance, données. */
export const useTasks = (getApiUrl: () => string) => {
  let status = $state<Task.Status>('pending')
  let tasks = $state<Task.Entity[] | undefined>(undefined)
  let errorMessage = $state<string | undefined>(undefined)

  const load = async () => {
    status = 'pending'
    try {
      tasks = await findAllTasks(getApiUrl())
      status = 'success'
    } catch {
      errorMessage = new TasksLoadError().message
      status = 'error'
    }
  }

  onMount(() => {
    void load()
  })

  return {
    get status() {
      return status
    },
    get tasks() {
      return tasks
    },
    get errorMessage() {
      return errorMessage
    },
    retry() {
      void load()
    },
  }
}
