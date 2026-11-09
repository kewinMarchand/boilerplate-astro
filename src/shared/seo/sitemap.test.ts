import { buildSitemapXml } from './sitemap'

const PRODUCT = [
  { locale: 'fr', path: '/produit/monstera' as const },
  { locale: 'en', path: '/produit/swiss-cheese-plant' as const },
]

describe('buildSitemapXml', () => {
  it('garde le sitemap simple sur un site monolingue', () => {
    const xml = buildSitemapXml({ locales: ['fr'], defaultLocale: 'fr' }, [[PRODUCT[0]!]])

    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('  <url><loc>http://localhost:4321/produit/monstera</loc></url>')
    expect(xml).not.toContain('xhtml')
  })

  it('donne une entrée par adresse et par langue, avec ses équivalents et x-default', () => {
    const xml = buildSitemapXml({ locales: ['fr', 'en'], defaultLocale: 'fr' }, [PRODUCT])
    const links =
      '<xhtml:link rel="alternate" hreflang="fr" href="http://localhost:4321/produit/monstera"/>' +
      '<xhtml:link rel="alternate" hreflang="en" href="http://localhost:4321/en/produit/swiss-cheese-plant"/>' +
      '<xhtml:link rel="alternate" hreflang="x-default" href="http://localhost:4321/produit/monstera"/>'

    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(xml).toContain(`<url><loc>http://localhost:4321/produit/monstera</loc>${links}</url>`)
    expect(xml).toContain(
      `<url><loc>http://localhost:4321/en/produit/swiss-cheese-plant</loc>${links}</url>`,
    )
    expect(xml).toContain('<url><loc>http://localhost:4321/en/contact</loc>')
  })
})
