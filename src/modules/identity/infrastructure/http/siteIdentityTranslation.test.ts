import { toSiteIdentity } from './siteIdentityTranslation'

import type { components } from '@/shared/api/client'

type SiteIdentityDto = components['schemas']['SiteIdentity']

const TOKENS = {
  primary: '#c2410c',
  'primary-dark': '#923109',
  'on-primary': '#ffffff',
  'primary-surface-subtle': '#faefeb',
  'primary-surface': '#f5e0d7',
  'primary-surface-strong': '#eecab9',
  secondary: '#0f766e',
  'secondary-dark': '#0b5953',
  'on-secondary': '#ffffff',
  'secondary-surface-subtle': '#ebf4f3',
  'secondary-surface': '#d8eae8',
  'secondary-surface-strong': '#bcdad7',
}

const DTO: SiteIdentityDto = {
  name: 'Oraki',
  tagline: 'Plantes rares et tropicales, livrées chez vous.',
  logo: null,
  icon: null,
  shareImage: null,
  defaultColorScheme: 'auto',
  theme: null,
}

const LOGO = {
  alt: 'Oraki',
  width: 400,
  height: 120,
  sources: [{ type: 'image/webp' as const, srcset: 'https://api/logo-200.webp 200w' }],
  src: 'https://api/logo-200.webp',
}

describe('toSiteIdentity', () => {
  it('garde nom, accroche et thème par défaut, sans logo, icône, image de partage ni couleurs', () => {
    expect(toSiteIdentity(DTO)).toEqual(DTO)
  })

  it('reprend le logo et les jetons clairs et sombres', () => {
    const theme = { light: TOKENS, dark: { ...TOKENS, primary: '#fdba74' } }

    expect(toSiteIdentity({ ...DTO, logo: LOGO, defaultColorScheme: 'dark', theme })).toEqual({
      ...DTO,
      logo: LOGO,
      defaultColorScheme: 'dark',
      theme,
    })
  })

  it('reprend l’icône et l’image de partage', () => {
    const icon = {
      png32: 'https://api/icon-32.png',
      png180: 'https://api/icon-180.png',
      png192: 'https://api/icon-192.png',
      png512: 'https://api/icon-512.png',
    }
    const shareImage = { ...LOGO, alt: 'Serre tropicale', width: 1200, height: 630 }

    expect(toSiteIdentity({ ...DTO, icon, shareImage })).toEqual({ ...DTO, icon, shareImage })
  })

  it('écarte le thème si un jeton n’est pas une couleur #rrggbb', () => {
    const theme = { light: TOKENS, dark: { ...TOKENS, primary: 'red}</style><script>' } }

    expect(toSiteIdentity({ ...DTO, theme }).theme).toBeNull()
  })
})
