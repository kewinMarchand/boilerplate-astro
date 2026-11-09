<script lang="ts">
  import { resolveHref } from '@/shared/routing'
  import { Button, Checkbox, Icon, Switch } from '@/shared/ui/kit'

  import { attributeParam, queryEntries } from '../domain/catalogQuery'

  import type { Catalog } from '../domain/catalog'
  import type { CatalogLabels } from './labels'

  interface Props {
    query: Catalog.Query
    listing: Catalog.Listing
    salesEnabled: boolean
    onsubmit: (event: Event) => void
    t: CatalogLabels
  }

  const { query, listing, salesEnabled, onsubmit, t }: Props = $props()

  const uid = $props.id()

  const keptFields = $derived(
    queryEntries({ ...query, attributes: {} }, [
      'exposition',
      'taille',
      'prix_min',
      'prix_max',
      'en_stock',
    ]),
  )
</script>

<form
  method="GET"
  class="flex flex-col gap-4"
  data-testid="catalog-filters"
  onchange={onsubmit}
  {onsubmit}
>
  {#each keptFields as [name, value] (name)}
    <input type="hidden" {name} {value} />
  {/each}

  <div class="bui-accordion">
    {#if listing.children.length > 0}
      <details open class="bui-accordion__item">
        <summary class="bui-accordion__summary">
          {t.catalog.category}<Icon name="chevron-down" class="bui-accordion__icon" />
        </summary>
        <ul class="bui-accordion__content flex flex-col">
          {#each listing.children as child (child.slug)}
            <li>
              <a href={resolveHref(child.path)} class="facet-link">
                {child.name} <span class="text-text-muted">({child.count})</span>
              </a>
            </li>
          {/each}
        </ul>
      </details>
    {/if}

    <details open class="bui-accordion__item">
      <summary class="bui-accordion__summary">
        {t.catalog.exposure}<Icon name="chevron-down" class="bui-accordion__icon" />
      </summary>
      <fieldset class="bui-accordion__content flex flex-col gap-2">
        <legend class="sr-only">{t.catalog.exposure}</legend>
        {#each listing.facets.exposure as { value, count } (value)}
          {@const checked = query.exposures.includes(value)}
          <Checkbox
            id="{uid}-exposition-{value}"
            label="{t.catalog.exposures[value]} ({count})"
            name="exposition"
            {value}
            {checked}
            disabled={count === 0 && !checked}
            data-testid={`catalog-filter-exposure-${value}`}
          />
        {/each}
      </fieldset>
    </details>

    <details open class="bui-accordion__item">
      <summary class="bui-accordion__summary">
        {t.catalog.size}<Icon name="chevron-down" class="bui-accordion__icon" />
      </summary>
      <fieldset class="bui-accordion__content flex flex-col gap-2">
        <legend class="sr-only">{t.catalog.size}</legend>
        {#each listing.facets.size as { value, count } (value)}
          {@const checked = query.sizes.includes(value)}
          <Checkbox
            id="{uid}-taille-{value}"
            label="{t.catalog.sizes[value]} ({count})"
            name="taille"
            {value}
            {checked}
            disabled={count === 0 && !checked}
            data-testid={`catalog-filter-size-${value}`}
          />
        {/each}
      </fieldset>
    </details>

    {#each listing.facets.attributes as facet (facet.code)}
      <details open class="bui-accordion__item">
        <summary class="bui-accordion__summary">
          {facet.label}<Icon name="chevron-down" class="bui-accordion__icon" />
        </summary>
        <fieldset class="bui-accordion__content flex flex-col gap-2">
          <legend class="sr-only">{facet.label}</legend>
          {#each facet.values as { value, label, count } (value)}
            {@const checked = query.attributes[facet.code]?.includes(value) ?? false}
            <Checkbox
              id="{uid}-{attributeParam(facet.code)}-{value}"
              label="{label} ({count})"
              name={attributeParam(facet.code)}
              {value}
              {checked}
              disabled={count === 0 && !checked}
              data-testid={`catalog-filter-attribute-${facet.code}-${value}`}
            />
          {/each}
        </fieldset>
      </details>
    {/each}

    {#if salesEnabled}
      <details open class="bui-accordion__item">
        <summary class="bui-accordion__summary">
          {t.catalog.price}<Icon name="chevron-down" class="bui-accordion__icon" />
        </summary>
        <fieldset class="bui-accordion__content flex flex-wrap gap-3">
          <legend class="sr-only">{t.catalog.priceLegend}</legend>
          {#each [{ name: 'prix_min', label: t.catalog.priceMin, value: query.priceMin, testId: 'catalog-filter-price-min' }, { name: 'prix_max', label: t.catalog.priceMax, value: query.priceMax, testId: 'catalog-filter-price-max' }] as field (field.name)}
            <div class="bui-field w-28">
              <label class="bui-field__label" for="{uid}-{field.name}">{field.label}</label>
              <input
                class="bui-field__input"
                type="number"
                id="{uid}-{field.name}"
                name={field.name}
                min="0"
                inputmode="numeric"
                value={field.value ?? ''}
                data-testid={field.testId}
              />
            </div>
          {/each}
        </fieldset>
      </details>
    {/if}

    <details open class="bui-accordion__item">
      <summary class="bui-accordion__summary">
        {t.catalog.availability}<Icon name="chevron-down" class="bui-accordion__icon" />
      </summary>
      <fieldset class="bui-accordion__content">
        <legend class="sr-only">{t.catalog.availability}</legend>
        <Switch
          id="{uid}-en-stock"
          label={t.catalog.inStockOnly}
          name="en_stock"
          value="1"
          checked={query.inStock}
          data-testid="catalog-filter-in-stock"
        />
      </fieldset>
    </details>
  </div>

  <Button type="submit" class="js:hidden">{t.catalog.applyFilters}</Button>
</form>
