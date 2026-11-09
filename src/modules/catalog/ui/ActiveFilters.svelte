<script lang="ts">
  import { Chip } from '@/shared/ui/kit'

  import { listActiveFilters } from './activeFilters'
  import { catalogHref } from './hooks/useCatalogNavigation.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { CatalogLabels } from './labels'
  import type { AppPath } from '@/shared/routing'
  import type { Snippet } from 'svelte'

  interface Props {
    path: AppPath
    query: Catalog.Query
    attributeFacets: Catalog.AttributeFacet[]
    clearAction: Snippet
    t: CatalogLabels
  }

  const { path, query, attributeFacets, clearAction, t }: Props = $props()

  const filters = $derived(listActiveFilters(query, attributeFacets, t.catalog))
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
            removeLabel={t.ui.removeFilter}
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
