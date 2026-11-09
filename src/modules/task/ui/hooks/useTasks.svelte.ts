import { onMount } from 'svelte'

import { findAllTasks } from '@/modules/task/infrastructure/taskRepository'

import type { Task } from '@/modules/task/domain/task'

interface TasksSource {
  apiUrl: string
  locale?: string | undefined
  scenario?: string | undefined
}

/** Chargement des tâches dans le navigateur : chargement, erreur avec relance, données. */
export const useTasks = (getSource: () => TasksSource) => {
  let status = $state<Task.Status>('pending')
  let tasks = $state<Task.Entity[] | undefined>(undefined)

  const load = async () => {
    status = 'pending'
    try {
      tasks = await findAllTasks(getSource())
      status = 'success'
    } catch {
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
    retry() {
      void load()
    },
  }
}
