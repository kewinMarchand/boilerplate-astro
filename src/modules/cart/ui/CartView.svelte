<script lang="ts">
  import { tick } from 'svelte'

  import { Button } from '@/shared/ui/kit'

  import { MAX_QUANTITY, totalPrice } from '../domain/cart'
  import { formatPrice } from '../domain/price'
  import { useCart } from './hooks/useCart.svelte'

  const CATALOG_PATH = '/catalogue'
  const productHref = (slug: string) => `/produit/${slug}`

  const uid = $props.id()
  const cart = useCart()

  let list: HTMLUListElement | null = null
  let empty: HTMLParagraphElement | null = null

  /**
   * Après un retrait, le focus va au bouton « Retirer » de la ligne qui prend la place, sinon de la
   * précédente, sinon au message de panier vide : sans cela, il retombe en haut de la page.
   */
  const removeLine = async (slug: string, index: number) => {
    cart.remove(slug)
    await tick()
    const buttons = list?.querySelectorAll<HTMLButtonElement>(':scope > li button')
    const target = buttons?.[Math.min(index, buttons.length - 1)] ?? empty
    target?.focus()
  }
</script>

<!-- Le panier n'existe que dans le navigateur : contenu rendu après le montage -->
{#if cart.ready}
  {#if cart.lines.length === 0}
    <p bind:this={empty} tabindex="-1" data-testid="cart-empty">
      Votre panier est vide. <a href={CATALOG_PATH} class="bui-link">Parcourir le catalogue</a>
    </p>
  {:else}
    <ul bind:this={list} class="grid gap-4">
      {#each cart.lines as line, index (line.slug)}
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
            onclick={() => removeLine(line.slug, index)}
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
