<script lang="ts">
  import { Icon } from '@/shared/ui/kit'

  import { catalogHref } from './hooks/useCatalogNavigation.svelte'
  import { paginationWindow } from './pagination'

  import type { Catalog } from '../domain/catalog'
  import type { AppPath } from '@/shared/routing'

  interface Props {
    path: AppPath
    query: Catalog.Query
    totalPages: number
  }

  const { path, query, totalPages }: Props = $props()

  const items = $derived(paginationWindow(query.page, totalPages))
  const hrefFor = (page: number) => catalogHref(path, { ...query, page })
</script>

{#if totalPages > 1}
  <nav
    class="bui-pagination mt-8"
    aria-label="Pagination"
    data-ui-chrome
    data-testid="catalog-pagination"
  >
    <ul class="bui-pagination__list">
      {#if query.page > 1}
        <li>
          <a class="bui-pagination__link" href={hrefFor(query.page - 1)} rel="prev"
            ><Icon name="chevron-left" /><span class="bui-pagination__label">Précédent</span></a
          >
        </li>
      {/if}
      {#each items as item, index (`${item}-${index}`)}
        {#if item === 'ellipsis'}
          <li class="bui-pagination__ellipsis" aria-hidden="true">…</li>
        {:else}
          <li>
            <a
              class="bui-pagination__link"
              href={hrefFor(item)}
              aria-current={item === query.page ? 'page' : undefined}
              ><span class="bui-visually-hidden">Page&nbsp;</span>{item}</a
            >
          </li>
        {/if}
      {/each}
      {#if query.page < totalPages}
        <li>
          <a class="bui-pagination__link" href={hrefFor(query.page + 1)} rel="next"
            ><span class="bui-pagination__label">Suivant</span><Icon name="chevron-right" /></a
          >
        </li>
      {/if}
    </ul>
  </nav>
{/if}
