<script lang="ts">
  import { Button, Icon } from '@/shared/ui/kit'

  import { countItems } from '../domain/cart'
  import { CART_PATH } from './cartPath'
  import { useCart } from './hooks/useCart.svelte'

  const cart = useCart()
  const count = $derived(countItems(cart.lines))
</script>

<!-- Nom accessible « Panier, 3 articles » : texte visible et compléments masqués (axe refuse un aria-label qui ne contient pas le texte affiché) -->
<Button href={CART_PATH} variant="nav" class="max-lg:shrink-0" data-testid="cart-link">
  <Icon name="shopping-cart" class="bui-icon--md" />
  <span class="max-sm:sr-only">Panier</span>
  {#if count > 0}
    <span class="bui-visually-hidden">, </span>
    <span
      class="min-w-6 rounded-full bg-on-primary px-1.5 text-center text-sm font-bold text-primary"
      data-testid="cart-count">{count}</span
    >
    <span class="bui-visually-hidden"> article{count > 1 ? 's' : ''}</span>
  {/if}
</Button>
