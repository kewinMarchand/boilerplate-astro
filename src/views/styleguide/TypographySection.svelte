<script lang="ts">
  import { useTypeMetrics } from './hooks/useComputedStyles.svelte'
  import Section from './Section.svelte'
  import { TYPE_SAMPLES } from './tokens'

  const elements = $state<(HTMLElement | null)[]>([])
  const metrics = useTypeMetrics(() => elements)
</script>

<Section id="typographie" title="Typographie">
  <ul class="flex flex-col gap-4">
    {#each TYPE_SAMPLES as sample, index (sample.label)}
      <li class="flex flex-col gap-1 border-b border-border-subtle pb-3">
        <svelte:element
          this={sample.tag === 'p' ? 'p' : 'div'}
          class={sample.className}
          bind:this={elements[index]}
        >
          {sample.label}
        </svelte:element>
        <span class="text-body-sm text-text-muted">
          {sample.tag} · <code>{sample.className}</code> · {metrics.metrics[index] || '…'}
        </span>
      </li>
    {/each}
  </ul>
</Section>
