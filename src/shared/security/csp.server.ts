import { cspReportRoute, startupLine } from '@kewinmarchand/csp'

import { siteCsp } from './csp'

export { CSP_HEADER } from '@kewinmarchand/csp'

/** En-tête Report-Only, calculé à l'exécution depuis les variables : rien à reconstruire pour les changer. */
export const siteCspHeader = () =>
  siteCsp({
    apiUrl: process.env['API_URL'] || 'http://localhost:8090',
    matomoUrl: process.env['PUBLIC_MATOMO_URL'],
    glitchtipDsn: process.env['PUBLIC_GLITCHTIP_DSN'],
  })

/** Route POST /api/csp-report : 204 et une ligne sur la sortie standard, 400 ou 413. */
export const cspReportHandler = cspReportRoute()

/** Ligne de démarrage, pour retrouver le bon fichier de log chez l'hébergeur. */
export const announceStartup = () =>
  process.stdout.write(
    `${startupLine('boilerplate-astro', import.meta.env.DEV ? 'development' : 'production')}\n`,
  )
