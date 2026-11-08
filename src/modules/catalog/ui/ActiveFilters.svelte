<script lang="ts">
  import { Chip } from '@/shared/ui/kit'

  import { listActiveFilters } from './activeFilters'
  import { catalogHref } from './hooks/useCatalogNavigation.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { AppPath } from '@/shared/routing'
  import type { Snippet } from 'svelte'

  interface Props {
    path: AppPath
    query: Catalog.Query
    attributeFacets: Catalog.AttributeFacet[]
    clearAction: Snippet
  }

  const { path, query, attributeFacets, clearAction }: Props = $props()

  const filters = $derived(listActiveFilters(query, attributeFacets))
</script>

{#if filters.length > 0}
  <div
    class="mb-4 flex flex-wrap items-center gap-2"
    data-ui-chrome
    data-testid="catalog-active-filters"
  >
    <ul class="bui-chip-list">
      {#each filters as filter (filter.label)}
        <li>
          <Chip
            href={catalogHref(path, filter.query)}
            removable
            data-testid="catalog-active-filter"
          >
            {filter.label}
          </Chip>
        </li>
      {/each}
    </ul>
    {@render clearAction()}
  </div>
{/if}
