<script lang="ts">
  import { Badge, ResponsiveImage } from '@/shared/ui/kit'

  import { formatPrice } from '../domain/price'
  import { EXPOSURE_LABELS, SIZE_LABELS } from './labels'
  import { PRODUCT_IMAGE } from './productImage'

  import type { Catalog } from '../domain/catalog'

  interface Props {
    product: Catalog.Product
    eager?: boolean
    priority?: boolean
    fetchPriority?: 'high' | 'low' | 'auto'
  }

  const {
    product,
    eager = false,
    priority = false,
    fetchPriority = priority ? 'high' : 'auto',
  }: Props = $props()
</script>

<article id={product.slug} class="product-card" data-testid="catalog-product">
  <div class="product-card-body">
    <ResponsiveImage
      basePath={PRODUCT_IMAGE.basePath(product.image)}
      widths={PRODUCT_IMAGE.widths}
      sizes={PRODUCT_IMAGE.sizes}
      width={800}
      height={800}
      alt={product.name}
      {eager}
      {priority}
      {fetchPriority}
      class="product-card-image"
    />
    <div class="flex flex-col gap-1 p-4">
      <h2 class="text-title font-semibold">{product.name}</h2>
      <p class="font-semibold" data-testid="catalog-product-price">{formatPrice(product.price)}</p>
      <p class="text-body-sm text-text-muted">
        {EXPOSURE_LABELS[product.exposure]} · Taille {SIZE_LABELS[product.size].toLowerCase()}
      </p>
      {#if !product.inStock}
        <p class="mt-1"><Badge variant="error">Rupture de stock</Badge></p>
      {/if}
    </div>
  </div>
</article>
