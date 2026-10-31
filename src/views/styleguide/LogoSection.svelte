<script lang="ts">
  import { SITE } from '@/shared/config'

  import Section from './Section.svelte'
</script>

<Section id="logo" title="Logo">
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="flex items-center gap-4 rounded-md border border-border-subtle bg-surface p-6">
      <img src="/logo-mark.svg" alt="" width="64" height="64" />
      <span class="logo-link text-text">{SITE.name}</span>
    </div>
    <div class="flex items-center gap-4 rounded-md bg-primary p-6 text-on-primary">
      <img src="/logo-mark.svg" alt="" width="64" height="64" />
      <span class="logo-link">{SITE.name}</span>
    </div>
  </div>
</Section>
