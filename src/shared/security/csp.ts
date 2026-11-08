import { buildCsp, CSP_REPORT_PATH, defaultDirectives } from '@kewinmarchand/csp'

import type { Directives } from '@kewinmarchand/csp'

export interface SiteOrigins {
  /** API appelée par le navigateur (tâches, contact), qui sert aussi les images et l'audio de contenu. */
  apiUrl: string
  /** Instance Matomo, quand la mesure d'audience est activée : script, appels et pixel de suivi. */
  matomoUrl?: string | undefined
  /** DSN GlitchTip du navigateur, quand le suivi des erreurs est activé : envoi des erreurs. */
  glitchtipDsn?: string | undefined
  /** Empreintes (`'sha256-…'`) des blocs `<style>` rendus par le serveur : couleurs de marque. */
  styleHashes?: string[] | undefined
}

const originOf = (address: string) => new URL(address).origin

/** En-tête Report-Only du site : seules les origines que le site charge réellement, selon ses variables. */
export const siteCsp = ({ apiUrl, matomoUrl, glitchtipDsn, styleHashes = [] }: SiteOrigins) => {
  const extra: Directives = { 'img-src': [originOf(apiUrl)], 'media-src': [originOf(apiUrl)] }
  if (matomoUrl) {
    const matomo = originOf(matomoUrl)
    Object.assign(extra, {
      'script-src': [matomo],
      'connect-src': [matomo],
      'img-src': [...(extra['img-src'] ?? []), matomo],
    })
  }
  if (glitchtipDsn) {
    extra['connect-src'] = [...(extra['connect-src'] ?? []), originOf(glitchtipDsn)]
  }
  if (styleHashes.length > 0) extra['style-src'] = styleHashes
  return buildCsp(defaultDirectives({ apiOrigin: apiUrl, extra }), { reportUri: CSP_REPORT_PATH })
}
