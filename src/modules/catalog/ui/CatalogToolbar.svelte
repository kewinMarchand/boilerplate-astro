<script lang="ts">
  import { Button, Chip, Select } from '@/shared/ui/kit'

  import { SORTS } from '../domain/catalog'
  import { queryEntries } from '../domain/catalogQuery'
  import { catalogHref } from './hooks/useCatalogNavigation.svelte'
  import { SORT_LABELS } from './labels'

  import type { Catalog } from '../domain/catalog'
  import type { AppPath } from '@/shared/routing'
  import type { Snippet } from 'svelte'

  interface Props {
    path: AppPath
    query: Catalog.Query
    total: number
    onSortChange: (sort: Catalog.Sort) => void
    filterButton: Snippet
  }

  const { path, query, total, onSortChange, filterButton }: Props = $props()

  const sortId = $props.id()
  const keptFields = $derived(queryEntries(query, ['tri']))
  const sortOptions = SORTS.map((sort) => ({ value: sort, label: SORT_LABELS[sort] }))

  const handleSortChange = (event: Event) => {
    const select = event.currentTarget
    if (!(select instanceof HTMLSelectElement)) return
    const sort = SORTS.find((value) => value === select.value)
    if (sort) onSortChange(sort)
  }
</script>

<div class="catalog-toolbar" data-ui-chrome>
  {@render filterButton()}
  <p role="status" class="grow font-semibold" data-testid="catalog-results-count">
    {total}
    {total > 1 ? 'produits' : 'produit'}
  </p>
  <form method="GET" class="flex items-end gap-2">
    {#each keptFields as [name, value], index (`${name}-${index}`)}
      <input type="hidden" {name} {value} />
    {/each}
    <Select
      id={sortId}
      label="Trier par"
      name="tri"
      options={sortOptions}
      value={query.sort}
      data-testid="catalog-sort"
      onchange={handleSortChange}
    />
    <Button type="submit" variant="outline" class="js:hidden">Trier</Button>
  </form>
  <nav aria-label="Affichage" class="flex gap-1">
    <Chip
      href={catalogHref(path, { ...query, view: 'grille' })}
      aria-current={query.view === 'grille' ? 'page' : undefined}
      data-testid="catalog-view-grid">Grille</Chip
    >
    <Chip
      href={catalogHref(path, { ...query, view: 'liste' })}
      aria-current={query.view === 'liste' ? 'page' : undefined}
      data-testid="catalog-view-list">Liste</Chip
    >
  </nav>
</div>
