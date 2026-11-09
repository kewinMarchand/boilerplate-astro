<script lang="ts">
  import { format } from '@/shared/i18n'
  import { resolveHref } from '@/shared/routing'
  import { Button } from '@/shared/ui/kit'

  import { CART_PATH } from './cartPath'
  import { useCart } from './hooks/useCart.svelte'

  import type { Cart } from '../domain/cart'

  // Vider puis remplir la région : un lecteur d'écran ne relit pas un texte identique
  const ANNOUNCE_DELAY_MS = 100

  interface Props {
    item: Cart.Item
    isAvailable: boolean
    /** Libellés dans la langue de la page. */
    labels: { add: string; added: string; view: string }
  }

  const { item, isAvailable, labels }: Props = $props()

  const cart = useCart()
  let isAdded = $state(false)

  const add = () => {
    cart.add(item)
    isAdded = false
    window.setTimeout(() => {
      isAdded = true
    }, ANNOUNCE_DELAY_MS)
  }
</script>

<!-- Absent sans JavaScript : le panier en dépend -->
{#if cart.ready}
  <div class="mb-6">
    <Button disabled={!isAvailable} onclick={add} data-testid="add-to-cart">
      {labels.add}
    </Button>
    <p role="status" class="mt-2" data-testid="add-to-cart-status">
      {#if isAdded}
        {format(labels.added, { name: item.name })}
        <a href={resolveHref(CART_PATH)} class="bui-link">{labels.view}</a>
      {/if}
    </p>
  </div>
{/if}
