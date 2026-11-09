import { expect, test } from '@playwright/test'

import { ROUTES } from './routes'

test.describe('SEO', () => {
  test('chaque route porte ses métadonnées, rendues côté serveur', async ({ request }) => {
    const titles = new Set<string>()

    for (const route of ROUTES) {
      const html = await (await request.get(route)).text()
      const meta = (pattern: RegExp) => html.match(pattern)?.[1]

      const title = meta(/<title>([^<]+)<\/title>/)
      expect(title, route).toBeTruthy()
      titles.add(title ?? '')

      const description = meta(/<meta name="description" content="([^"]+)"/) ?? ''
      expect(description.length, `${route} : ${description}`).toBeGreaterThanOrEqual(50)
      expect(description.length, route).toBeLessThanOrEqual(160)

      expect(meta(/<link rel="canonical" href="([^"]+)"/), route).toMatch(/^https?:\/\//)
      expect(meta(/<meta property="og:title" content="([^"]+)"/), route).toBeTruthy()
      expect(meta(/<meta property="og:description" content="([^"]+)"/), route).toBeTruthy()
      expect(meta(/<meta property="og:image" content="([^"]+)"/), route).toMatch(/^https?:\/\//)
      expect(html, route).toContain('<html lang="fr"')

      for (const [, json] of html.matchAll(
        /<script type="application\/ld\+json">(.*?)<\/script>/g,
      )) {
        expect(() => JSON.parse(json ?? ''), route).not.toThrow()
      }
    }

    expect(titles.size).toBe(ROUTES.length)
  })

  test('l’accueil déclare Organization et WebSite', async ({ request }) => {
    const html = await (await request.get('/')).text()
    expect(html).toContain('"@type":"Organization"')
    expect(html).toContain('"@type":"WebSite"')
  })

  test('une page filtrée est en noindex avec une canonique sans filtre', async ({ request }) => {
    const html = await (
      await request.get('/catalogue/plantes-interieur?exposition=soleil&page=1')
    ).text()
    expect(html).toContain('<meta name="robots" content="noindex, follow"')
    expect(html).toMatch(
      /<link rel="canonical" href="http:\/\/localhost:4100\/catalogue\/plantes-interieur"/,
    )
    expect(html).toContain('"@type":"ItemList"')
  })

  test('le sitemap liste chaque catégorie et robots.txt y renvoie', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/catalogue/plantes-interieur/feuillages/monstera</loc>')
    expect(sitemap).not.toContain('charte-graphique')

    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Sitemap: http://localhost:4100/sitemap.xml')
  })
})
