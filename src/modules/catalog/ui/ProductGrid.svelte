<script lang="ts">
  import { Alert, Button, Icon, Skeleton } from '@/shared/ui/kit'

  import ProductCard from './ProductCard.svelte'

  import type { Catalog } from '../domain/catalog'
  import type { CatalogLabels } from './labels'
  import type { Snippet } from 'svelte'

  interface Props {
    status: Catalog.Status
    products: Catalog.Product[]
    view: Catalog.View
    showPrice: boolean
    t: CatalogLabels
    onRetry: () => void
    clearAction: Snippet
  }

  const { status, products, view, showPrice, t, onRetry, clearAction }: Props = $props()

  const EAGER_COUNT = 4
</script>

{#if status === 'pending'}
  <div class="catalog-grid" role="status" aria-label={t.catalog.loading}>
    {#each [1, 2, 3, 4] as key (key)}
      <Skeleton height="320px" />
    {/each}
  </div>
{:else if status === 'error'}
  <div class="flex flex-col items-start gap-3">
    <Alert variant="error" prefix={t.ui.alert.error} data-testid="catalog-error"
      >{t.catalog.loadError}</Alert
    >
    <Button variant="outline" onclick={onRetry} data-testid="catalog-retry"
      ><Icon name="rotate-cw" />{t.catalog.retry}
    </Button>
  </div>
{:else if products.length === 0}
  <div class="flex flex-col items-start gap-4" data-testid="catalog-empty">
    <Alert variant="info" prefix={t.ui.alert.info}>{t.catalog.empty}</Alert>
    {@render clearAction()}
  </div>
{:else}
  <ul class="catalog-grid" data-view={view}>
    {#each products as product, index (product.id)}
      <li>
        <ProductCard
          {product}
          {t}
          {showPrice}
          eager={index < EAGER_COUNT}
          priority={index === 0}
          fetchPriority={index === 0 ? 'high' : index < EAGER_COUNT ? 'low' : 'auto'}
        />
      </li>
    {/each}
  </ul>
{/if}
