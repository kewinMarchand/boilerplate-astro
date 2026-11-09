import { MAX_QUANTITY } from '../domain/cart'

import type { Cart } from '../domain/cart'

const STORAGE_KEY = 'panier'
const CHANGE_EVENT = 'panier:change'

// Validation écrite à la main plutôt que par zod : le lien du header l'envoie sur chaque page.
const isText = (value: unknown) => typeof value === 'string' && value.length > 0

const isIntegerBetween = (value: unknown, min: number, max: number) =>
  Number.isSafeInteger(value) && typeof value === 'number' && value >= min && value <= max

const isTranslation = (value: unknown): value is Cart.Translation =>
  typeof value === 'object' &&
  value !== null &&
  'locale' in value &&
  isText(value.locale) &&
  'slug' in value &&
  isText(value.slug) &&
  'name' in value &&
  isText(value.name)

/** Ligne enregistrée ; `id` et `translations` absents d'un panier enregistré avant les langues. */
type StoredLine = Omit<Cart.Line, 'id' | 'translations'> &
  Partial<Pick<Cart.Line, 'id' | 'translations'>>

const isLine = (value: unknown): value is StoredLine =>
  typeof value === 'object' &&
  value !== null &&
  (!('id' in value) || isText(value.id)) &&
  (!('translations' in value) ||
    (Array.isArray(value.translations) && value.translations.every(isTranslation))) &&
  'slug' in value &&
  isText(value.slug) &&
  'name' in value &&
  isText(value.name) &&
  'price' in value &&
  isIntegerBetween(value.price, 0, Number.MAX_SAFE_INTEGER) &&
  'quantity' in value &&
  isIntegerBetween(value.quantity, 1, MAX_QUANTITY)

/** Panier enregistré ; vide si l'entrée est absente, illisible ou invalide. */
export const parseCart = (raw: string | null): Cart.Line[] => {
  if (raw === null) return []
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) && value.every(isLine)
      ? value.map(({ id, slug, name, price, quantity, translations = [] }) => ({
          // Panier enregistré avant les langues : le slug identifie la ligne.
          id: id ?? slug,
          slug,
          name,
          price,
          quantity,
          translations: translations.map((translation) => ({
            locale: translation.locale,
            slug: translation.slug,
            name: translation.name,
          })),
        }))
      : []
  } catch {
    return []
  }
}

const readRawCart = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

let memory: string | null = null

/** Valeur brute, gardée en mémoire si le stockage refuse l'écriture (navigation privée, quota). */
export const currentRawCart = () => readRawCart() ?? memory

export const saveCart = (lines: readonly Cart.Line[]) => {
  memory = JSON.stringify(lines)
  try {
    localStorage.setItem(STORAGE_KEY, memory)
  } catch {
    // Le panier vaut alors pour la page en cours.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Prévient des changements de cet onglet et des autres (événement `storage`). */
export const subscribeToCart = (onChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}
