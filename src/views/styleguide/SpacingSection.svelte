<script lang="ts">
  import Section from './Section.svelte'
  import { SPACING_STEPS } from './tokens'
</script>

<Section id="espacements" title="Espacements et rayons">
  <ul class="mb-6 flex flex-col gap-2">
    {#each SPACING_STEPS as step (step)}
      <li class="flex items-center gap-3 text-body-sm">
        <code class="w-32">--spacing × {step}</code>
        <span class="h-4 rounded-md bg-primary" style:width={`calc(var(--spacing) * ${step})`}
        ></span>
      </li>
    {/each}
    <li class="flex items-center gap-3 text-body-sm">
      <code class="w-32">--spacing-touch</code>
      <span class="size-touch rounded-md bg-secondary"></span>
    </li>
  </ul>
  <div class="flex items-center gap-3 text-body-sm">
    <span class="size-16 rounded-md border-2 border-primary"></span>
    <code>--radius-md</code>
  </div>
</Section>
