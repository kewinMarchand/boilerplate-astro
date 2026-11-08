import { buildHomeJsonLd, buildPageMeta, DEFAULT_SHARE_IMAGE } from './buildPageMeta'

const IDENTITY = { name: 'Oraki', shareImage: null }
const INPUT = { title: 'Blog', description: 'Tous les articles du blog.', path: '/blog' }

const SHARE_IMAGE = {
  alt: '',
  width: 1200,
  height: 630,
  sources: [
    { type: 'image/avif', srcset: 'https://api/media/partage-1200.avif 1200w' },
    { type: 'image/webp', srcset: 'https://api/media/partage-1200.webp 1200w' },
  ],
  src: 'https://api/media/partage-1200.webp',
}

describe('buildPageMeta', () => {
  it('sans métadonnées saisies, garde le titre suivi du nom du site et la description', () => {
    const meta = buildPageMeta({ ...INPUT, metaTitle: '', metaDescription: '' }, IDENTITY)

    expect(meta).toMatchObject({
      title: 'Blog · Oraki',
      ogTitle: 'Blog',
      description: 'Tous les articles du blog.',
    })
  })

  it('sert tels quels le titre et la description saisis', () => {
    const meta = buildPageMeta(
      { ...INPUT, metaTitle: 'Le blog des plantes rares', metaDescription: 'Conseils.' },
      IDENTITY,
    )

    expect(meta).toMatchObject({
      title: 'Le blog des plantes rares',
      ogTitle: 'Le blog des plantes rares',
      description: 'Conseils.',
    })
  })

  it('prend l’image du site sans image de partage saisie', () => {
    expect(buildPageMeta(INPUT, IDENTITY).image.path).toBe(DEFAULT_SHARE_IMAGE.path)
  })

  it('prend l’image de partage saisie par défaut, nommée par le site sans texte de remplacement', () => {
    const meta = buildPageMeta(INPUT, { ...IDENTITY, shareImage: SHARE_IMAGE })

    expect(meta.image).toEqual({
      path: 'https://api/media/partage-1200.webp',
      url: 'https://api/media/partage-1200.webp',
      width: 1200,
      height: 630,
      alt: 'Oraki',
    })
  })

  it('garde l’image propre à la page', () => {
    const image = { path: '/images/fiche.webp', width: 800, height: 800, alt: 'Fiche' }

    expect(
      buildPageMeta({ ...INPUT, image }, { ...IDENTITY, shareImage: SHARE_IMAGE }).image.path,
    ).toBe('/images/fiche.webp')
  })
})

describe('buildHomeJsonLd', () => {
  const logoOf = (jsonLd: Record<string, unknown>[]) =>
    jsonLd.find((data) => data['@type'] === 'Organization')?.['logo']

  it('prend l’icône du site sans icône saisie', () => {
    expect(logoOf(buildHomeJsonLd({ name: 'Oraki', icon: null }))).toMatch(/\/icon-512\.png$/)
  })

  it('prend l’icône 512 saisie', () => {
    const icon = {
      png32: 'https://api/icon-32.png',
      png180: 'https://api/icon-180.png',
      png192: 'https://api/icon-192.png',
      png512: 'https://api/icon-512.png',
    }

    expect(logoOf(buildHomeJsonLd({ name: 'Oraki', icon }))).toBe('https://api/icon-512.png')
  })
})
