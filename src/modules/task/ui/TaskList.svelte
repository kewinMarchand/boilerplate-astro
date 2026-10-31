<script lang="ts">
  import { Alert, Button, Icon, Skeleton } from '@/shared/ui/kit'

  import type { Task } from '../domain/task'

  interface Props {
    status: Task.Status
    tasks: Task.Entity[] | undefined
    errorMessage?: string | undefined
    onRetry: () => void
  }

  const { status, tasks, errorMessage, onRetry }: Props = $props()
</script>

{#if status === 'pending'}
  <div
    class="flex flex-col gap-2"
    role="status"
    aria-busy="true"
    aria-label="Chargement des tâches"
    data-testid="tasks-loading"
  >
    {#each [1, 2, 3] as key (key)}
      <Skeleton />
    {/each}
  </div>
{:else if status === 'error'}
  <div class="flex flex-col items-start gap-3">
    <Alert variant="error" data-testid="tasks-error">{errorMessage}</Alert>
    <Button variant="outline" onclick={onRetry} data-testid="tasks-retry"
      ><Icon name="rotate-cw" />Réessayer
    </Button>
  </div>
{:else if !tasks?.length}
  <Alert variant="info" data-testid="tasks-empty">
    Aucune tâche pour l'instant. Tout est à jour.
  </Alert>
{:else}
  <ul class="flex flex-col" data-testid="tasks-list">
    {#each tasks as task (task.id)}
      <li class="flex items-center gap-4 py-2" data-testid="tasks-item">
        <Icon name={task.done ? 'circle-check' : 'list-todo'} />
        <div>
          <p>{task.title}</p>
          <p class="text-body-sm text-text-muted">{task.done ? 'Terminée' : 'À faire'}</p>
        </div>
      </li>
    {/each}
  </ul>
{/if}
