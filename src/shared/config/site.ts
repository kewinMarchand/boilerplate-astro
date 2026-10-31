import type { AccessibilityAudit } from './accessibility'

export interface LegalEntity {
  name: string
  address: string
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  locale: string
  publisher: LegalEntity & {
    siret: string
    publicationDirector: string
    email: string
  }
  host: LegalEntity
  accessibility: AccessibilityAudit
}

export const SITE: SiteConfig = {
  name: 'Boilerplate Astro',
  description:
    'Boilerplate Astro pour sites de contenu, rendu serveur et composants boilerplates-ui, outillé pour la QA et les tests end-to-end.',
  // Lue à l'exécution sur le serveur (image Docker), repli sur `site` d'Astro figé au build ; aussi importée
  // par des îlots, d'où globalThis.process (absent du navigateur, qui n'utilise pas d'URL absolue).
  url: globalThis.process?.env['PUBLIC_SITE_URL'] ?? import.meta.env.SITE,
  locale: 'fr_FR',
  publisher: {
    name: 'Exemple SAS (société fictive)',
    address: '1 rue de l’Exemple, 13000 Marseille (adresse fictive)',
    siret: '000 000 000 00000 (numéro fictif)',
    publicationDirector: 'Prénom Nom (personne fictive)',
    email: 'contact@exemple.fr',
  },
  host: {
    name: 'Hébergeur Exemple (société fictive)',
    address: '2 avenue de l’Exemple, 75000 Paris (adresse fictive)',
  },
  accessibility: { auditDate: null, complianceRate: null, auditor: null },
}
