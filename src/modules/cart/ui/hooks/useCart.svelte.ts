import { onMount } from 'svelte'

import { addItem, removeItem, setQuantity } from '@/modules/cart/domain/cart'
import {
  currentRawCart,
  parseCart,
  saveCart,
  subscribeToCart,
} from '@/modules/cart/infrastructure/cartStorage'

import type { Cart } from '@/modules/cart/domain/cart'

/** Panier du navigateur : vide au rendu serveur, lu au montage, partagé entre îlots et onglets. */
export const useCart = () => {
  let lines = $state<Cart.Line[]>([])
  let ready = $state(false)

  onMount(() => {
    const read = () => {
      lines = parseCart(currentRawCart())
    }
    read()
    ready = true
    return subscribeToCart(read)
  })

  const update = (change: (current: Cart.Line[]) => Cart.Line[]) =>
    saveCart(change(parseCart(currentRawCart())))

  return {
    get lines() {
      return lines
    },
    /** Faux jusqu'au montage : ce qui dépend du panier n'est rendu qu'avec JavaScript. */
    get ready() {
      return ready
    },
    add: (item: Cart.Item) => update((current) => addItem(current, item)),
    changeQuantity: (slug: string, quantity: number) =>
      update((current) => setQuantity(current, slug, quantity)),
    remove: (slug: string) => update((current) => removeItem(current, slug)),
  }
}
