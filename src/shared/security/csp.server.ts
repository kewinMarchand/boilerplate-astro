import { createHash } from 'node:crypto'

import { cspReportRoute, startupLine } from '@kewinmarchand/csp'

import { siteCsp } from './csp'

export { CSP_HEADER } from '@kewinmarchand/csp'

/** Bloc que le rendu d'Astro écrit dans chaque page à îlots, hors de portée de `build.inlineStylesheets`. */
export const ASTRO_ISLAND_STYLE = 'astro-island,astro-slot,astro-static-slot{display:contents}'

const sha256Source = (content: string) =>
  `'sha256-${createHash('sha256').update(content).digest('base64')}'`

/**
 * En-tête Report-Only, calculé à l'exécution depuis les variables : rien à reconstruire pour les changer.
 * `inlineStyles` : contenu exact des blocs `<style>` rendus par le serveur, autorisés par leur empreinte.
 */
export const siteCspHeader = (inlineStyles: string[] = []) =>
  siteCsp({
    apiUrl: process.env['API_URL'] || 'http://localhost:8090',
    matomoUrl: process.env['PUBLIC_MATOMO_URL'],
    glitchtipDsn: process.env['PUBLIC_GLITCHTIP_DSN'],
    styleHashes: inlineStyles.map(sha256Source),
  })

/** Route POST /api/csp-report : 204 et une ligne sur la sortie standard, 400 ou 413. */
export const cspReportHandler = cspReportRoute()

/** Ligne de démarrage, pour retrouver le bon fichier de log chez l'hébergeur. */
export const announceStartup = () =>
  process.stdout.write(
    `${startupLine('boilerplate-astro', import.meta.env.DEV ? 'development' : 'production')}\n`,
  )
