<script lang="ts">
  import { Drawer } from '@kewinmarchand/boilerplates-ui/svelte'

  import type { Snippet } from 'svelte'

  interface Props {
    open: boolean
    title: string
    side?: 'start' | 'end'
    triggerClass?: string
    triggerLabel?: string
    triggerTestId?: string
    panelTestId?: string
    trigger: Snippet
    children: Snippet
  }

  let {
    open = $bindable(false),
    title,
    side = 'end',
    triggerClass,
    triggerLabel,
    triggerTestId,
    panelTestId,
    trigger,
    children,
  }: Props = $props()

  const id = $props.id()
</script>

<button
  type="button"
  class={triggerClass}
  aria-label={triggerLabel}
  aria-haspopup="dialog"
  aria-expanded={open}
  aria-controls={id}
  data-testid={triggerTestId}
  onclick={() => (open = true)}
>
  {@render trigger()}
</button>
<!-- Monté seulement ouvert : un `<dialog>` fermé laisserait son contenu (champs, data-testid) dans la page. -->
{#if open}
  <Drawer {id} {title} {side} open data-testid={panelTestId} onclose={() => (open = false)}>
    {@render children()}
  </Drawer>
{/if}
