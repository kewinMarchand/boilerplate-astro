import { pageViewCommands, setupCommands } from './matomo'
import { mesureRefusee } from './oppositionMesure'

import type { MatomoCommand, MatomoConfig } from './matomo'

declare global {
  interface Window {
    _paq?: { push: (command: MatomoCommand) => unknown }
  }
}

/** Une page vue au chargement, puis une par navigation du routeur client (catalogue), URL et titre à jour. */
export const startMatomo = (config: MatomoConfig | null) => {
  if (!config) return
  let previousUrl: string | undefined

  const track = () => {
    // Refus lu avant la première commande (section 16 de la spec) : ni file, ni script, ni requête.
    if (mesureRefusee()) return
    const queue = (window._paq ??= [] as unknown as NonNullable<Window['_paq']>)
    if (previousUrl === undefined) {
      setupCommands(config).forEach((command) => queue.push(command))
      const script = document.createElement('script')
      script.async = true
      script.src = config.scriptUrl
      document.head.append(script)
    }
    const url = window.location.href
    pageViewCommands({ url, title: document.title, referrer: previousUrl }).forEach((command) =>
      queue.push(command),
    )
    previousUrl = url
  }

  track()
  document.addEventListener('astro:after-swap', track)
}
