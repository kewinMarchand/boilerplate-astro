<script lang="ts">
  import { Button } from '@/shared/ui/kit'

  import { MAX_QUANTITY, totalPrice } from '../domain/cart'
  import { formatPrice } from '../domain/price'
  import { useCart } from './hooks/useCart.svelte'

  const CATALOG_PATH = '/catalogue'
  const productHref = (slug: string) => `/produit/${slug}`

  const uid = $props.id()
  const cart = useCart()
</script>

<!-- Le panier n'existe que dans le navigateur : contenu rendu après le montage -->
{#if cart.ready}
  {#if cart.lines.length === 0}
    <p data-testid="cart-empty">
      Votre panier est vide. <a href={CATALOG_PATH} class="bui-link">Parcourir le catalogue</a>
    </p>
  {:else}
    <ul class="grid gap-4">
      {#each cart.lines as line (line.slug)}
        <li
          class="grid items-center gap-2 border-b border-border pb-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_10rem_minmax(0,1fr)_auto]"
          data-testid="cart-line"
        >
          <a href={productHref(line.slug)} class="bui-link font-semibold">{line.name}</a>
          <span>{formatPrice(line.price)} l’unité</span>
          <div class="bui-field">
            <label class="bui-field__label" for="{uid}-{line.slug}">Quantité de {line.name}</label>
            <input
              id="{uid}-{line.slug}"
              type="number"
              min="1"
              max={MAX_QUANTITY}
              value={line.quantity}
              oninput={(event) => {
                const quantity = event.currentTarget.valueAsNumber
                if (!Number.isNaN(quantity)) cart.changeQuantity(line.slug, quantity)
              }}
              class="bui-field__input"
              data-testid="cart-quantity"
            />
          </div>
          <span class="font-semibold">{formatPrice(line.price * line.quantity)}</span>
          <Button
            variant="outline"
            aria-label="Retirer {line.name}"
            onclick={() => cart.remove(line.slug)}
            data-testid="cart-remove"
          >
            Retirer
          </Button>
        </li>
      {/each}
    </ul>
    <p class="mt-6 mb-2 text-title font-semibold">
      Total : <span data-testid="cart-total">{formatPrice(totalPrice(cart.lines))}</span>
    </p>
    <p>La commande en ligne arrive bientôt.</p>
  {/if}
{/if}
