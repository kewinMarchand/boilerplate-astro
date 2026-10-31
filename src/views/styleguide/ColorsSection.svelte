<script lang="ts">
  import { useColorTokens } from './hooks/useComputedStyles.svelte'
  import Section from './Section.svelte'
  import { COLOR_TOKENS } from './tokens'

  const tokens = useColorTokens(COLOR_TOKENS)
</script>

<Section id="couleurs" title="Couleurs">
  <p class="mb-4">Ratio de contraste calculé sur le fond <code>--bui-color-surface</code>.</p>
  <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each tokens.samples as sample (sample.name)}
      <li class="flex items-center gap-3 rounded-md border border-border-subtle p-3">
        <span
          class="size-12 shrink-0 rounded-md border border-border-subtle"
          style:background-color={`var(--bui-color-${sample.name})`}
        ></span>
        <span class="flex flex-col text-body-sm">
          <code class="font-semibold">--bui-color-{sample.name}</code>
          <span>{sample.value || '…'}</span>
          <span>
            {sample.ratio === null
              ? 'Ratio : …'
              : `Ratio ${sample.ratio.toFixed(2)}:1 · ${sample.level}`}
          </span>
        </span>
      </li>
    {/each}
  </ul>
</Section>
