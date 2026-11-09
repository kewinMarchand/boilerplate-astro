import { buildHomeJsonLd, buildPageMeta, DEFAULT_SHARE_IMAGE } from './buildPageMeta'

const IDENTITY = { name: 'Oraki', shareImage: null }
const INPUT = { title: 'Blog', description: 'Tous les articles du blog.', path: '/blog' }
const MONOLINGUAL = {
  locale: { locale: 'fr', defaultLocale: 'fr', locales: ['fr'] },
  alternates: [{ locale: 'fr', path: '/blog' as const }],
}
const BILINGUAL = {
  locale: { locale: 'en', defaultLocale: 'fr', locales: ['fr', 'en'] },
  alternates: [
    { locale: 'fr', path: '/produit/monstera' as const },
    { locale: 'en', path: '/produit/swiss-cheese-plant' as const },
  ],
}

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
    const meta = buildPageMeta(
      { ...INPUT, metaTitle: '', metaDescription: '' },
      IDENTITY,
      MONOLINGUAL,
    )

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
      MONOLINGUAL,
    )

    expect(meta).toMatchObject({
      title: 'Le blog des plantes rares',
      ogTitle: 'Le blog des plantes rares',
      description: 'Conseils.',
    })
  })

  it('prend l’image du site sans image de partage saisie', () => {
    expect(buildPageMeta(INPUT, IDENTITY, MONOLINGUAL).image.path).toBe(DEFAULT_SHARE_IMAGE.path)
  })

  it('prend l’image de partage saisie par défaut, nommée par le site sans texte de remplacement', () => {
    const meta = buildPageMeta(INPUT, { ...IDENTITY, shareImage: SHARE_IMAGE }, MONOLINGUAL)

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
      buildPageMeta({ ...INPUT, image }, { ...IDENTITY, shareImage: SHARE_IMAGE }, MONOLINGUAL)
        .image.path,
    ).toBe('/images/fiche.webp')
  })
})

describe('buildPageMeta, langues', () => {
  it('n’ajoute ni hreflang ni og:locale:alternate sur un site monolingue', () => {
    const meta = buildPageMeta(INPUT, IDENTITY, MONOLINGUAL)

    expect(meta.canonical).toBe('http://localhost:4321/blog')
    expect(meta.locale).toBe('fr_FR')
    expect(meta.hreflang).toEqual([])
    expect(meta.alternateLocales).toEqual([])
  })

  it('donne la canonique préfixée, chaque langue et x-default vers la langue par défaut', () => {
    const meta = buildPageMeta(
      { ...INPUT, path: '/produit/swiss-cheese-plant' },
      IDENTITY,
      BILINGUAL,
    )

    expect(meta.canonical).toBe('http://localhost:4321/en/produit/swiss-cheese-plant')
    expect(meta.locale).toBe('en_US')
    expect(meta.alternateLocales).toEqual(['fr_FR'])
    expect(meta.hreflang).toEqual([
      { hreflang: 'fr', href: 'http://localhost:4321/produit/monstera' },
      { hreflang: 'en', href: 'http://localhost:4321/en/produit/swiss-cheese-plant' },
      { hreflang: 'x-default', href: 'http://localhost:4321/produit/monstera' },
    ])
  })
})

describe('buildHomeJsonLd', () => {
  const logoOf = (jsonLd: Record<string, unknown>[]) =>
    jsonLd.find((data) => data['@type'] === 'Organization')?.['logo']

  it('prend l’icône du site sans icône saisie', () => {
    expect(
      logoOf(buildHomeJsonLd({ name: 'Oraki', icon: null }, MONOLINGUAL.locale, 'fr-FR')),
    ).toMatch(/\/icon-512\.png$/)
  })

  it('prend l’icône 512 saisie', () => {
    const icon = {
      png32: 'https://api/icon-32.png',
      png180: 'https://api/icon-180.png',
      png192: 'https://api/icon-192.png',
      png512: 'https://api/icon-512.png',
    }

    expect(logoOf(buildHomeJsonLd({ name: 'Oraki', icon }, MONOLINGUAL.locale, 'fr-FR'))).toBe(
      'https://api/icon-512.png',
    )
  })
})
