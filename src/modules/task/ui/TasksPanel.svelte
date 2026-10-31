<script lang="ts">
  import { useTasks } from './hooks/useTasks.svelte'
  import TaskList from './TaskList.svelte'

  interface Props {
    apiUrl: string
  }

  const { apiUrl }: Props = $props()

  const tasks = useTasks(() => apiUrl)
</script>

<div aria-live="polite">
  <TaskList
    status={tasks.status}
    tasks={tasks.tasks}
    errorMessage={tasks.errorMessage}
    onRetry={tasks.retry}
  />
</div>
