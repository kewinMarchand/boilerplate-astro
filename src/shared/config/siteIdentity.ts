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

/** Identité du site administrée dans l'API (spec commune, section 22). */
export interface SiteIdentity {
  name: string
  tagline: string
  logo: ImageView | null
  defaultColorScheme: 'auto' | 'light' | 'dark'
  /** `null` sans couleur de marque saisie : les jetons de boilerplates-ui restent tels quels. */
  theme: { light: BrandTokens; dark: BrandTokens } | null
}

/** Repli quand l'API est en erreur ou injoignable : la page reste servie avec la configuration du site. */
export const SITE_IDENTITY_FALLBACK: SiteIdentity = {
  name: SITE.name,
  tagline: SITE.description,
  logo: null,
  defaultColorScheme: 'auto',
  theme: null,
}
