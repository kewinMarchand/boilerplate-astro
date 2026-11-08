import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { expect, test } from '@playwright/test'

import type { APIRequestContext } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import type { Server } from 'node:http'

const API_URL = process.env['API_URL'] || 'http://localhost:8090'
const PRODUCT = 'monstera-deliciosa'
const ARTICLE = 'un-carrousel-accessible-sans-dependance'

const PAGE_PATHS = {
  home: '/',
  catalog: '/catalogue',
  blog: '/blog',
  contact: '/contact',
  sitemap: '/plan-du-site',
  'legal-notice': '/mentions-legales',
  privacy: '/donnees-personnelles',
  accessibility: '/accessibilite',
} as const

const headOf = async (request: APIRequestContext, url: string) => {
  const html = await (await request.get(url)).text()
  const attribute = (selector: RegExp) => html.match(selector)?.[1]
  return {
    html,
    title: attribute(/<title>([^<]*)<\/title>/),
    description: attribute(/<meta name="description" content="([^"]*)"/),
    ogTitle: attribute(/<meta property="og:title" content="([^"]*)"/),
    ogDescription: attribute(/<meta property="og:description" content="([^"]*)"/),
    ogImage: attribute(/<meta property="og:image" content="([^"]*)"/),
    twitterImage: attribute(/<meta name="twitter:image" content="([^"]*)"/),
  }
}

const decode = (text = '') =>
  text.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&')

test.describe('Métadonnées sans saisie dans l’admin', () => {
  test('les pages gardent leurs titres et l’image de partage du site', async ({ request }) => {
    const contact = await headOf(request, '/contact')

    expect(contact.title).toBe('Contact · Boilerplate')
    expect(contact.ogTitle).toBe('Contact')
    expect(contact.description).toMatch(/^Démo de formulaire/)
    expect(contact.ogImage).toMatch(/\/og-image\.jpg$/)
    expect(contact.twitterImage).toBe(contact.ogImage)

    const product = await headOf(request, `/produit/${PRODUCT}`)
    expect(product.title).toBe('Monstera deliciosa · Boilerplate')
    expect(product.ogImage).toMatch(/^https?:\/\/.+\.webp$/)
  })

  test('la description saisie de la page blog est servie, son titre reste le titre actuel', async ({
    request,
  }) => {
    const metas = (await (await request.get(`${API_URL}/api/page-metas`)).json()) as {
      page: string
      description: string
    }[]
    const blog = await headOf(request, '/blog')

    expect(decode(blog.description)).toBe(metas.find((meta) => meta.page === 'blog')?.description)
    expect(decode(blog.ogDescription)).toBe(decode(blog.description))
    expect(blog.title).toBe('Blog · Boilerplate')
  })

  test('les icônes restent celles du site', async ({ request }) => {
    const { html } = await headOf(request, '/')

    expect(html).toContain('<link rel="icon" href="/favicon.ico" sizes="48x48">')
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png">')
    const manifest = (await (await request.get('/manifest.webmanifest')).json()) as {
      icons: { src: string }[]
    }
    expect(manifest.icons.map((icon) => icon.src)).toEqual(['/icon-192.png', '/icon-512.png'])
    expect(html).toMatch(/"logo":"https?:\/\/[^"]+\/icon-512\.png"/)
  })
})

// L'API locale n'a ni métadonnées (sauf la description du blog), ni icône, ni image de partage : un faux serveur
// les sert et relaie le reste à l'API, devant un second serveur du site (build de production).
test.describe('Métadonnées, icône et image de partage saisies dans l’admin', () => {
  test.describe.configure({ mode: 'serial' })

  const ports = (project: string) =>
    project === 'mobile' ? { site: 3175, api: 3185 } : { site: 3174, api: 3184 }
  let siteUrl = ''
  let apiUrl = ''
  let fakeApi: Server
  let site: ChildProcess

  const pageTitle = (page: string) => `Titre saisi : ${page}`
  const pageDescription = (page: string) =>
    `Description saisie dans l’admin pour la page ${page}, assez longue pour un moteur de recherche.`

  test.beforeAll(async () => {
    const { site: sitePort, api: apiPort } = ports(test.info().project.name)
    apiUrl = `http://127.0.0.1:${apiPort}`
    siteUrl = `http://127.0.0.1:${sitePort}`
    const png = readFileSync('public/icon-192.png')
    const jpeg = readFileSync('public/og-image.jpg')
    const upstream = async (path: string) =>
      (await (await fetch(`${API_URL}${path}`)).json()) as Record<string, unknown>

    const overrides: Record<string, () => Promise<unknown>> = {
      '/api/site-identity': async () => ({
        ...(await upstream('/api/site-identity')),
        shareImage: {
          alt: 'Serre tropicale',
          width: 1200,
          height: 630,
          sources: [],
          src: `${apiUrl}/partage.jpg`,
        },
        icon: {
          png32: `${apiUrl}/icone-32.png`,
          png180: `${apiUrl}/icone-180.png`,
          png192: `${apiUrl}/icone-192.png`,
          png512: `${apiUrl}/icone-512.png`,
        },
      }),
      '/api/page-metas': async () =>
        Object.keys(PAGE_PATHS).map((page) => ({
          page,
          title: pageTitle(page),
          description: pageDescription(page),
        })),
      [`/api/products/${PRODUCT}`]: async () => ({
        ...(await upstream(`/api/products/${PRODUCT}`)),
        metaTitle: 'Monstera deliciosa, la plante à feuilles fendues',
        metaDescription:
          'Le monstera deliciosa : grandes feuilles fendues, croissance rapide, idéal en intérieur lumineux.',
      }),
      [`/api/articles/${ARTICLE}`]: async () => ({
        ...(await upstream(`/api/articles/${ARTICLE}`)),
        metaTitle: 'Carrousel accessible : le guide sans dépendance',
        metaDescription:
          'Construire un carrousel accessible avec le défilement natif et des boutons explicites.',
      }),
      // Premier article sans rubrique : absence du sur-titre
      '/api/articles': async () => {
        const articles = (await (await fetch(`${API_URL}/api/articles`)).json()) as object[]
        return articles.map((article, index) =>
          index === 0 ? { ...article, section: null } : article,
        )
      },
    }

    fakeApi = createServer(async (request, response) => {
      const path = request.url ?? '/'
      if (path === '/partage.jpg') {
        response.writeHead(200, { 'content-type': 'image/jpeg' }).end(jpeg)
        return
      }
      if (path.startsWith('/icone-')) {
        response.writeHead(200, { 'content-type': 'image/png' }).end(png)
        return
      }
      const override = overrides[path]
      if (override) {
        response
          .writeHead(200, { 'content-type': 'application/json' })
          .end(JSON.stringify(await override()))
        return
      }
      const relayed = await fetch(`${API_URL}${path}`)
      response
        .writeHead(relayed.status, {
          'content-type': relayed.headers.get('content-type') ?? 'application/json',
        })
        .end(Buffer.from(await relayed.arrayBuffer()))
    }).listen(apiPort, '127.0.0.1')

    site = spawn('node', ['server.mjs'], {
      env: { ...process.env, PORT: String(sitePort), HOST: '127.0.0.1', API_URL: apiUrl },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(siteUrl).catch(() => null))?.status, { timeout: 15_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    site.kill()
    fakeApi.close()
  })

  test('chaque page fixe sert le titre et la description saisis', async ({ request }) => {
    for (const [page, path] of Object.entries(PAGE_PATHS)) {
      const head = await headOf(request, `${siteUrl}${path}`)

      expect(head.title, path).toBe(pageTitle(page))
      expect(head.ogTitle, path).toBe(pageTitle(page))
      expect(decode(head.description), path).toBe(pageDescription(page))
      expect(decode(head.ogDescription), path).toBe(pageDescription(page))
    }
  })

  test('une page de catégorie garde son titre calculé', async ({ request }) => {
    const head = await headOf(request, `${siteUrl}/catalogue/plantes-interieur`)

    expect(head.title).toMatch(/^Plantes d.intérieur · Boilerplate$/)
  })

  test('la fiche produit et la fiche article servent leurs métadonnées saisies', async ({
    request,
  }) => {
    const product = await headOf(request, `${siteUrl}/produit/${PRODUCT}`)
    expect(product.title).toBe('Monstera deliciosa, la plante à feuilles fendues')
    expect(product.ogTitle).toBe(product.title)
    expect(decode(product.description)).toMatch(/^Le monstera deliciosa : grandes feuilles/)

    const article = await headOf(request, `${siteUrl}/blog/${ARTICLE}`)
    expect(article.title).toBe('Carrousel accessible : le guide sans dépendance')
    expect(decode(article.description)).toMatch(/^Construire un carrousel accessible/)
  })

  test('titres et descriptions servis restent dans les longueurs du référencement', async ({
    request,
  }) => {
    for (const path of [...Object.values(PAGE_PATHS), `/produit/${PRODUCT}`, `/blog/${ARTICLE}`]) {
      const head = await headOf(request, `${siteUrl}${path}`)

      expect(decode(head.title).length, path).toBeLessThanOrEqual(60)
      expect(decode(head.description).length, path).toBeLessThanOrEqual(160)
    }
  })

  test('l’image de partage saisie sert par défaut, une fiche garde son image', async ({
    request,
  }) => {
    const contact = await headOf(request, `${siteUrl}/contact`)
    expect(contact.ogImage).toBe(`${apiUrl}/partage.jpg`)
    expect(contact.twitterImage).toBe(`${apiUrl}/partage.jpg`)
    expect(contact.html).toContain('<meta property="og:image:alt" content="Serre tropicale">')

    const product = await headOf(request, `${siteUrl}/produit/${PRODUCT}`)
    expect(product.ogImage).not.toBe(`${apiUrl}/partage.jpg`)
  })

  test('l’icône saisie remplace favicon, icône d’écran d’accueil et icônes du manifeste', async ({
    page,
  }) => {
    await page.goto(`${siteUrl}/contact`)

    const icon = page.locator('link[rel="icon"]')
    await expect(icon).toHaveCount(1)
    await expect(icon).toHaveAttribute('href', `${apiUrl}/icone-32.png`)
    await expect(icon).toHaveAttribute('sizes', '32x32')
    await expect(icon).toHaveAttribute('type', 'image/png')
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      `${apiUrl}/icone-180.png`,
    )
    const manifest = (await (await page.request.get(`${siteUrl}/manifest.webmanifest`)).json()) as {
      icons: { src: string; sizes: string }[]
    }
    expect(manifest.icons).toEqual([
      { src: `${apiUrl}/icone-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${apiUrl}/icone-512.png`, sizes: '512x512', type: 'image/png' },
    ])
  })

  test('le JSON-LD Organization de l’accueil prend l’icône 512 saisie', async ({ request }) => {
    const { html } = await headOf(request, siteUrl)

    expect(html).toContain(`"logo":"${apiUrl}/icone-512.png"`)
  })

  test('une carte d’article sans rubrique n’a pas de sur-titre', async ({ page }) => {
    await page.goto(`${siteUrl}/blog`)

    const cards = page.getByTestId('blog-card')
    await expect(cards.first().getByTestId('article-section')).toHaveCount(0)
    await expect(cards.nth(1).getByTestId('article-section')).toHaveCount(1)
  })
})
