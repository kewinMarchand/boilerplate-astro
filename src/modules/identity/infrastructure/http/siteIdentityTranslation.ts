import type { BrandTokens, SiteIdentity } from '@/modules/identity/domain/siteIdentity'
import type { components } from '@/shared/api/client'

type SiteIdentityDto = components['schemas']['SiteIdentity']
type ThemeTokensDto = components['schemas']['ThemeTokens']

const HEX_COLOR = /^#[0-9a-f]{6}$/i

// Les jetons finissent dans un bloc <style> : une valeur hors `#rrggbb` écarte tout le thème.
const toBrandTokens = (dto: ThemeTokensDto): BrandTokens | null =>
  Object.values(dto).every((value) => HEX_COLOR.test(value)) ? { ...dto } : null

const toTheme = (dto: SiteIdentityDto['theme']): SiteIdentity['theme'] => {
  if (!dto) return null
  const light = toBrandTokens(dto.light)
  const dark = toBrandTokens(dto.dark)
  return light && dark ? { light, dark } : null
}

export const toSiteIdentity = (dto: SiteIdentityDto): SiteIdentity => ({
  name: dto.name,
  tagline: dto.tagline,
  logo: dto.logo,
  icon: dto.icon,
  shareImage: dto.shareImage,
  defaultColorScheme: dto.defaultColorScheme,
  theme: toTheme(dto.theme),
  salesEnabled: dto.salesEnabled,
  // Absente d'une API antérieure aux langues (section 29) : site monolingue en français
  locales: dto.locales ?? ['fr'],
})
