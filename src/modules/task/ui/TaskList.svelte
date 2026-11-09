<script lang="ts" module>
  /** Libellés dans la langue de la page (`tasks` du dictionnaire, sans titre ni texte d'introduction). */
  export interface TaskLabels {
    loading: string
    loadError: string
    retry: string
    empty: string
    done: string
    todo: string
  }
</script>

<script lang="ts">
  import { Alert, Button, Icon, Skeleton } from '@/shared/ui/kit'

  import type { Task } from '../domain/task'

  interface Props {
    status: Task.Status
    tasks: Task.Entity[] | undefined
    labels: TaskLabels
    onRetry: () => void
  }

  const { status, tasks, labels, onRetry }: Props = $props()
</script>

{#if status === 'pending'}
  <div
    class="flex flex-col gap-2"
    role="status"
    aria-busy="true"
    aria-label={labels.loading}
    data-testid="tasks-loading"
  >
    {#each [1, 2, 3] as key (key)}
      <Skeleton />
    {/each}
  </div>
{:else if status === 'error'}
  <div class="flex flex-col items-start gap-3">
    <Alert variant="error" data-testid="tasks-error">{labels.loadError}</Alert>
    <Button variant="outline" onclick={onRetry} data-testid="tasks-retry"
      ><Icon name="rotate-cw" />{labels.retry}
    </Button>
  </div>
{:else if !tasks?.length}
  <Alert variant="info" data-testid="tasks-empty">
    {labels.empty}
  </Alert>
{:else}
  <ul class="flex flex-col" data-testid="tasks-list">
    {#each tasks as task (task.id)}
      <li class="flex items-center gap-4 py-2" data-testid="tasks-item">
        <Icon name={task.done ? 'circle-check' : 'list-todo'} />
        <div>
          <p>{task.title}</p>
          <p class="text-body-sm text-text-muted">{task.done ? labels.done : labels.todo}</p>
        </div>
      </li>
    {/each}
  </ul>
{/if}
