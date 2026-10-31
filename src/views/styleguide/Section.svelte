<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    id: string
    title: string
    children: Snippet
  }

  const { id, title, children }: Props = $props()
</script>

<section aria-labelledby={id} class="mb-12" data-testid={`styleguide-section-${id}`}>
  <h2 {id} class="section-title">{title}</h2>
  {@render children()}
</section>
