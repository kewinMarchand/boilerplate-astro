import type { SiteIdentity } from '@/shared/config'

/** Couleur principale de la marque, sinon celle des jetons de boilerplates-ui. */
export const themeColor = ({ theme }: SiteIdentity) => theme?.light.primary ?? '#1d4ed8'

export const buildWebManifest = (identity: SiteIdentity) =>
  JSON.stringify({
    name: identity.name,
    short_name: identity.name,
    lang: 'fr',
    start_url: '/',
    display: 'standalone',
    theme_color: themeColor(identity),
    background_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  })
