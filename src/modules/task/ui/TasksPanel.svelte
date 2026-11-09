<script lang="ts">
  import { useTasks } from './hooks/useTasks.svelte'
  import TaskList from './TaskList.svelte'

  import type { TaskLabels } from './TaskList.svelte'

  interface Props {
    apiUrl: string
    labels: TaskLabels
    /** Langue de la page, passée à l'API sur un site multilingue. */
    locale?: string
    /** Scénario de l'API fixé pour tout le site (`API_SCENARIO`). */
    scenario?: string
  }

  const { apiUrl, labels, locale, scenario }: Props = $props()

  const tasks = useTasks(() => ({ apiUrl, locale, scenario }))
</script>

<div aria-live="polite">
  <TaskList status={tasks.status} tasks={tasks.tasks} {labels} onRetry={tasks.retry} />
</div>
