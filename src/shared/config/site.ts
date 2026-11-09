import type { AccessibilityAudit } from './accessibility'

export interface SiteConfig {
  name: string
  description: string
  url: string
  publisher: {
    name: string
    email: string
  }
  accessibility: AccessibilityAudit
}

export const SITE: SiteConfig = {
  name: 'Boilerplate Astro',
  description:
    'Boilerplate Astro pour sites de contenu, rendu serveur et composants boilerplates-ui, outillé pour la QA et les tests end-to-end.',
  // Lue à l'exécution sur le serveur (image Docker), repli sur `site` d'Astro figé au build ; aussi importée
  // par des îlots, d'où globalThis.process (absent du navigateur, qui n'utilise pas d'URL absolue).
  url: globalThis.process?.env['PUBLIC_SITE_URL'] ?? import.meta.env.SITE,
  publisher: {
    name: 'Exemple SAS (société fictive)',
    email: 'contact@exemple.fr',
  },
  accessibility: { auditDate: null, complianceRate: null, auditor: null },
}
