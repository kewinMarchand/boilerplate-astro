import { onMount, tick } from 'svelte'
import { navigate } from 'astro:transitions/client'

import { resolveHref } from '@/shared/routing'

import {
  queryFromFormData,
  serializeCatalogQuery,
  withFilter,
} from '@/modules/catalog/domain/catalogQuery'
import { CATALOG_ROOT_PATH } from '@/modules/catalog/domain/categoryPath'

import type { Catalog } from '@/modules/catalog/domain/catalog'
import type { AppPath } from '@/shared/routing'
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client'

const PAGE_TITLE_ID = 'page-title'

export const catalogHref = (path: AppPath, query: Catalog.Query) =>
  resolveHref(`${path}${serializeCatalogQuery(query)}`)

/**
 * Navigation du catalogue par le routeur client d'Astro (ClientRouter, posé par la page catalogue).
 * L'îlot est conservé d'une page à l'autre (transition:persist) : le focus reste sur le contrôle manipulé.
 */
export const useCatalogNavigation = (getPath: () => AppPath, getQuery: () => Catalog.Query) => {
  let pending = $state(false)
  let keepFocus = false

  const apply = (query: Catalog.Query) => navigate(catalogHref(getPath(), query))

  onMount(() => {
    const start = (event: Event) => {
      const { to } = event as TransitionBeforePreparationEvent
      pending = to.pathname.startsWith(resolveHref(CATALOG_ROOT_PATH))
      // Filtre ou tri : le focus reste sur le champ manipulé. Lien (pagination, Tout effacer) : retour au titre.
      keepFocus = document.activeElement?.closest('form') != null
    }
    const end = async () => {
      pending = false
      await tick()
      if (!keepFocus) document.getElementById(PAGE_TITLE_ID)?.focus()
    }
    document.addEventListener('astro:before-preparation', start)
    document.addEventListener('astro:after-swap', end)
    return () => {
      document.removeEventListener('astro:before-preparation', start)
      document.removeEventListener('astro:after-swap', end)
    }
  })

  return {
    get pending() {
      return pending
    },
    update(patch: Partial<Omit<Catalog.Query, 'page'>>) {
      void apply(withFilter(getQuery(), patch))
    },
    submitForm(event: Event) {
      event.preventDefault()
      const form = event.currentTarget
      if (form instanceof HTMLFormElement) void apply(queryFromFormData(new FormData(form)))
    },
    retry() {
      void navigate(window.location.href, { history: 'replace' })
    },
  }
}
