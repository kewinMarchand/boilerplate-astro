<script lang="ts">
  import { tick } from 'svelte'

  import { format } from '@/shared/i18n'
  import { resolveHref } from '@/shared/routing'
  import { Button } from '@/shared/ui/kit'

  import { MAX_QUANTITY, totalPrice } from '../domain/cart'
  import { formatPrice } from '../domain/price'
  import { useCart } from './hooks/useCart.svelte'

  import type { AppPath } from '@/shared/routing'

  interface Props {
    /** Libellés dans la langue de la page (`cart` du dictionnaire, sans titre ni description). */
    labels: {
      empty: string
      browseCatalog: string
      unitPrice: string
      quantityOf: string
      remove: string
      removeItem: string
      total: string
      soon: string
      tag: string
    }
  }

  const { labels }: Props = $props()

  const CATALOG_PATH: AppPath = '/catalogue'
  const productHref = (slug: string): AppPath => `/produit/${slug}`

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
      {labels.empty}
      <a href={resolveHref(CATALOG_PATH)} class="bui-link">{labels.browseCatalog}</a>
    </p>
  {:else}
    <ul bind:this={list} class="grid gap-4">
      {#each cart.lines as line, index (line.slug)}
        <li
          class="grid items-center gap-2 border-b border-border pb-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_10rem_minmax(0,1fr)_auto]"
          data-testid="cart-line"
        >
          <a href={resolveHref(productHref(line.slug))} class="bui-link font-semibold"
            >{line.name}</a
          >
          <span>{format(labels.unitPrice, { price: formatPrice(line.price, labels.tag) })}</span>
          <div class="bui-field">
            <label class="bui-field__label" for="{uid}-{line.slug}"
              >{format(labels.quantityOf, { name: line.name })}</label
            >
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
          <span class="font-semibold">{formatPrice(line.price * line.quantity, labels.tag)}</span>
          <Button
            variant="outline"
            aria-label={format(labels.removeItem, { name: line.name })}
            onclick={() => removeLine(line.slug, index)}
            data-testid="cart-remove"
          >
            {labels.remove}
          </Button>
        </li>
      {/each}
    </ul>
    <p class="mt-6 mb-2 text-title font-semibold">
      {labels.total}
      <span data-testid="cart-total">{formatPrice(totalPrice(cart.lines), labels.tag)}</span>
    </p>
    <p>{labels.soon}</p>
  {/if}
{/if}
