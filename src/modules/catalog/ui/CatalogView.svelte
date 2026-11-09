<script lang="ts">
  import { format } from '@/shared/i18n'
  import { resolveHref } from '@/shared/routing'
  import { useIsDesktop } from '@/shared/ui/hooks'
  import { Button, Chip, Drawer, Icon } from '@/shared/ui/kit'

  import { clearFilters, countActiveFilters } from '../domain/catalogQuery'
  import { CATALOG_ROOT_PATH } from '../domain/categoryPath'
  import ActiveFilters from './ActiveFilters.svelte'
  import CatalogFilters from './CatalogFilters.svelte'
  import CatalogToolbar from './CatalogToolbar.svelte'
  import { catalogHref, useCatalogNavigation } from './hooks/useCatalogNavigation.svelte'
  import Pagination from './Pagination.svelte'
  import ProductGrid from './ProductGrid.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { CatalogLabels } from './labels'

  interface Props {
    query: Catalog.Query
    result: Catalog.Result
    salesEnabled: boolean
    /** Libellés du catalogue dans la langue de la page. */
    t: CatalogLabels
  }

  const { query, result, salesEnabled, t }: Props = $props()

  const listing = $derived(result.status === 'success' ? result.listing : undefined)
  const path = $derived(listing?.chain.at(-1)?.path ?? CATALOG_ROOT_PATH)

  const navigation = useCatalogNavigation(
    () => path,
    () => query,
  )
  const isDesktop = useIsDesktop()
  let filtersOpen = $state(false)

  const status = $derived<Catalog.Status>(navigation.pending ? 'pending' : result.status)
  const activeCount = $derived(countActiveFilters(query))
</script>

{#snippet clearAction()}
  <Button
    href={catalogHref(path, clearFilters(query))}
    variant="outline"
    data-testid="catalog-clear-filters"
  >
    {t.catalog.clearFilters}
  </Button>
{/snippet}

{#if listing && listing.children.length > 0}
  <nav aria-label={t.catalog.subcategories} class="mb-6">
    <ul class="bui-chip-list">
      {#each listing.children as child (child.slug)}
        <li><Chip href={resolveHref(child.path)}>{child.name} ({child.count})</Chip></li>
      {/each}
    </ul>
  </nav>
{/if}

<div class="catalog-layout">
  {#if listing && isDesktop.current}
    <aside aria-labelledby="catalog-filters-title" class="catalog-aside">
      <h2 id="catalog-filters-title" class="mb-4 text-title font-semibold">
        {t.catalog.filters}
      </h2>
      <CatalogFilters {query} {listing} {salesEnabled} {t} onsubmit={navigation.submitForm} />
    </aside>
  {/if}

  <div class="min-w-0">
    {#snippet filterButton()}
      {#if listing}
        <Drawer
          bind:open={filtersOpen}
          title={t.catalog.filters}
          closeLabel={t.close}
          side="start"
          triggerClass="bui-button bui-button--outline hidden js:max-lg:inline-flex"
          triggerTestId="catalog-filters-open"
        >
          {#snippet trigger()}
            <Icon name="sliders-horizontal" />
            {t.catalog.filterButton}{activeCount > 0 ? ` (${activeCount})` : ''}
          {/snippet}
          <CatalogFilters {query} {listing} {salesEnabled} {t} onsubmit={navigation.submitForm} />
          <Button class="mt-6 w-full" onclick={() => (filtersOpen = false)}>
            {format(t.catalog.showProducts, { total: listing.total })}
          </Button>
        </Drawer>
      {/if}
    {/snippet}

    <CatalogToolbar
      {path}
      {query}
      total={listing?.total ?? 0}
      {salesEnabled}
      {t}
      onSortChange={(sort) => navigation.update({ sort })}
      {filterButton}
    />
    <ActiveFilters
      {path}
      {query}
      attributeFacets={listing?.facets.attributes ?? []}
      {clearAction}
      {t}
    />
    <ProductGrid
      {status}
      products={listing?.products ?? []}
      view={query.view}
      showPrice={salesEnabled}
      {t}
      onRetry={navigation.retry}
      {clearAction}
    />
    {#if listing}
      <Pagination {path} {query} totalPages={listing.totalPages} {t} />
    {/if}
  </div>
</div>
