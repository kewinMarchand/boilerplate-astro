<script lang="ts">
  import { format } from '@/shared/i18n'
  import { resolveHref } from '@/shared/routing'
  import { Badge, ResponsiveImage } from '@/shared/ui/kit'

  import { productHref } from '../domain/catalog'
  import { formatPrice } from '../domain/price'
  import { PRODUCT_IMAGE_SIZES } from './productImage'

  import type { Catalog } from '../domain/catalog'
  import type { CatalogLabels } from './labels'

  interface Props {
    product: Catalog.Product
    t: Pick<CatalogLabels, 'catalog' | 'language'>
    showPrice?: boolean
    eager?: boolean
    priority?: boolean
    fetchPriority?: 'high' | 'low' | 'auto'
  }

  const {
    product,
    t,
    showPrice = true,
    eager = false,
    priority = false,
    fetchPriority = priority ? 'high' : 'auto',
  }: Props = $props()
</script>

<article id={product.slug} class="product-card" data-testid="catalog-product">
  <div class="product-card-body">
    {#if product.image}
      <ResponsiveImage
        image={product.image}
        sizes={PRODUCT_IMAGE_SIZES}
        {eager}
        {priority}
        {fetchPriority}
        pictureClass="@lg:self-start"
        class="product-card-image"
      />
    {:else}
      <div class="product-card-image bg-surface-muted"></div>
    {/if}
    <div class="flex flex-col gap-1 p-4">
      <h2 class="text-title font-semibold">
        <a
          href={resolveHref(productHref(product.slug))}
          class="bui-link product-card-link"
          data-testid="catalog-product-link">{product.name}</a
        >
      </h2>
      {#if showPrice}
        <p class="font-semibold" data-testid="catalog-product-price">
          {formatPrice(product.price, t.language.tag)}
        </p>
      {/if}
      <p class="text-body-sm text-text-muted">
        {format(t.catalog.cardFeatures, {
          exposure: t.catalog.exposures[product.exposure],
          size: t.catalog.sizes[product.size].toLowerCase(),
        })}
      </p>
      {#if !product.inStock}
        <p class="mt-1"><Badge variant="error">{t.catalog.outOfStock}</Badge></p>
      {/if}
    </div>
  </div>
</article>

<style>
  .product-card {
    position: relative;
  }

  /* Lien étiré sur toute la carte : un seul lien, nommé par le nom du produit */
  .product-card-link::after {
    position: absolute;
    inset: 0;
    content: '';
  }
</style>
