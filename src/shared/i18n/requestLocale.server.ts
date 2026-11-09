import { AsyncLocalStorage } from 'node:async_hooks'

import { setPageLanguageSource } from './pageLanguage'

import type { LocaleContext } from './locale'

// Langue de la requête en cours, posée par le middleware : les liens (`resolveHref`) la lisent pendant le rendu
// sans recevoir la requête, comme le X-Scenario (`withRequestScenario`).
const requestLocaleStore = new AsyncLocalStorage<LocaleContext>()

export const withRequestLocale = <T>(locale: LocaleContext, run: () => T): T =>
  requestLocaleStore.run(locale, run)

setPageLanguageSource(() => requestLocaleStore.getStore())
