import { SITE } from './site'

import type { ImageView } from '@/shared/ui/kit'

export const BRAND_TOKEN_KEYS = [
  'primary',
  'primary-dark',
  'on-primary',
  'primary-surface-subtle',
  'primary-surface',
  'primary-surface-strong',
  'secondary',
  'secondary-dark',
  'on-secondary',
  'secondary-surface-subtle',
  'secondary-surface',
  'secondary-surface-strong',
] as const

export type BrandTokenKey = (typeof BRAND_TOKEN_KEYS)[number]

/** Couleurs `#rrggbb` des douze jetons de marque (`--bui-color-<clé>`). */
export type BrandTokens = Record<BrandTokenKey, string>

/** Icône du site en PNG carrés, adresses absolues (favicon, écran d'accueil, manifeste). */
export interface SiteIcon {
  png32: string
  png180: string
  png192: string
  png512: string
}

/** Identité du site administrée dans l'API (spec commune, sections 22 et 26). */
export interface SiteIdentity {
  name: string
  tagline: string
  logo: ImageView | null
  /** `null` : les fichiers d'icônes du site (`public/`). */
  icon: SiteIcon | null
  /** Image de partage par défaut (1200 × 630) ; `null` : `og-image.jpg` du site. */
  shareImage: ImageView | null
  defaultColorScheme: 'auto' | 'light' | 'dark'
  /** `null` sans couleur de marque saisie : les jetons de boilerplates-ui restent tels quels. */
  theme: { light: BrandTokens; dark: BrandTokens } | null
}

/** Repli quand l'API est en erreur ou injoignable : la page reste servie avec la configuration du site. */
export const SITE_IDENTITY_FALLBACK: SiteIdentity = {
  name: SITE.name,
  tagline: SITE.description,
  logo: null,
  icon: null,
  shareImage: null,
  defaultColorScheme: 'auto',
  theme: null,
}
