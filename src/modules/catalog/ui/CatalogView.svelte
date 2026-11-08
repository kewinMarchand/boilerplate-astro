<script lang="ts">
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

  interface Props {
    query: Catalog.Query
    result: Catalog.Result
  }

  const { query, result }: Props = $props()

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
    Tout effacer
  </Button>
{/snippet}

{#if listing && listing.children.length > 0}
  <nav aria-label="Sous-catégories" class="mb-6">
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
      <h2 id="catalog-filters-title" class="mb-4 text-title font-semibold">Filtres</h2>
      <CatalogFilters {query} {listing} onsubmit={navigation.submitForm} />
    </aside>
  {/if}

  <div class="min-w-0">
    {#snippet filterButton()}
      {#if listing}
        <Drawer
          bind:open={filtersOpen}
          title="Filtres"
          side="start"
          triggerClass="bui-button bui-button--outline hidden js:max-lg:inline-flex"
          triggerTestId="catalog-filters-open"
        >
          {#snippet trigger()}
            <Icon name="sliders-horizontal" />
            Filtrer{activeCount > 0 ? ` (${activeCount})` : ''}
          {/snippet}
          <CatalogFilters {query} {listing} onsubmit={navigation.submitForm} />
          <Button class="mt-6 w-full" onclick={() => (filtersOpen = false)}>
            Voir les {listing.total} produits
          </Button>
        </Drawer>
      {/if}
    {/snippet}

    <CatalogToolbar
      {path}
      {query}
      total={listing?.total ?? 0}
      onSortChange={(sort) => navigation.update({ sort })}
      {filterButton}
    />
    <ActiveFilters
      {path}
      {query}
      attributeFacets={listing?.facets.attributes ?? []}
      {clearAction}
    />
    <ProductGrid
      {status}
      products={listing?.products ?? []}
      view={query.view}
      errorMessage={result.status === 'error' ? result.message : undefined}
      onRetry={navigation.retry}
      {clearAction}
    />
    {#if listing}
      <Pagination {path} {query} totalPages={listing.totalPages} />
    {/if}
  </div>
</div>
