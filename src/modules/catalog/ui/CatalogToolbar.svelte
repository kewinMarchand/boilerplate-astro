<script lang="ts">
  import { plural } from '@/shared/i18n'
  import { Button, Chip, Select } from '@/shared/ui/kit'

  import { PRICE_SORTS, SORTS } from '../domain/catalog'
  import { queryEntries } from '../domain/catalogQuery'
  import { catalogHref } from './hooks/useCatalogNavigation.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { CatalogLabels } from './labels'
  import type { AppPath } from '@/shared/routing'
  import type { Snippet } from 'svelte'

  interface Props {
    path: AppPath
    query: Catalog.Query
    total: number
    salesEnabled: boolean
    onSortChange: (sort: Catalog.Sort) => void
    filterButton: Snippet
    t: CatalogLabels
  }

  const { path, query, total, salesEnabled, onSortChange, filterButton, t }: Props = $props()

  const sortId = $props.id()
  const keptFields = $derived(queryEntries(query, ['tri']))
  const sortOptions = $derived(
    SORTS.filter((sort) => salesEnabled || !PRICE_SORTS.includes(sort)).map((sort) => ({
      value: sort,
      label: t.catalog.sorts[sort],
    })),
  )

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
    {plural(t.catalog.productCount, total, t.language.tag)}
  </p>
  <form method="GET" class="flex items-end gap-2">
    {#each keptFields as [name, value], index (`${name}-${index}`)}
      <input type="hidden" {name} {value} />
    {/each}
    <Select
      id={sortId}
      label={t.catalog.sortBy}
      name="tri"
      options={sortOptions}
      value={query.sort}
      data-testid="catalog-sort"
      onchange={handleSortChange}
    />
    <Button type="submit" variant="outline" class="js:hidden">{t.catalog.sort}</Button>
  </form>
  <nav aria-label={t.catalog.display} class="flex gap-1">
    <Chip
      href={catalogHref(path, { ...query, view: 'grille' })}
      aria-current={query.view === 'grille' ? 'page' : undefined}
      data-testid="catalog-view-grid">{t.catalog.views.grille}</Chip
    >
    <Chip
      href={catalogHref(path, { ...query, view: 'liste' })}
      aria-current={query.view === 'liste' ? 'page' : undefined}
      data-testid="catalog-view-list">{t.catalog.views.liste}</Chip
    >
  </nav>
</div>
