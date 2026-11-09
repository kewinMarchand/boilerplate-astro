<script lang="ts">
  import { plural } from '@/shared/i18n'
  import { resolveHref } from '@/shared/routing'
  import { Button, Icon } from '@/shared/ui/kit'

  import { countItems } from '../domain/cart'
  import { CART_PATH } from './cartPath'
  import { useCart } from './hooks/useCart.svelte'

  interface Props {
    /** Libellés dans la langue de la page. */
    labels: { title: string; itemCount: { one: string; other: string }; tag: string }
  }

  const { labels }: Props = $props()
  const cart = useCart()
  const count = $derived(countItems(cart.lines))
</script>

<!-- Nom accessible « Panier, 3 articles » : texte visible et compléments masqués (axe refuse un aria-label qui ne contient pas le texte affiché) -->
<Button href={resolveHref(CART_PATH)} variant="nav" class="max-lg:shrink-0" data-testid="cart-link">
  <Icon name="shopping-cart" class="bui-icon--md" />
  <span class="max-sm:sr-only">{labels.title}</span>
  {#if count > 0}
    <span class="bui-visually-hidden">, </span>
    <span
      class="min-w-6 rounded-full bg-on-primary px-1.5 text-center text-sm font-bold text-primary"
      data-testid="cart-count">{count}</span
    >
    <span class="bui-visually-hidden">{plural(labels.itemCount, count, labels.tag)}</span>
  {/if}
</Button>
