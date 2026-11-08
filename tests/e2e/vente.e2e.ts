import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { MODES } from './routes'
import { gotoHydrated, useMode } from './support'

import type { Page } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import type { Server } from 'node:http'

const API_URL = process.env['API_URL'] || 'http://localhost:8090'
const PRODUCT = 'monstera-deliciosa'
const PRODUCT_NAME = 'Monstera deliciosa'
const OUT_OF_STOCK = 'monstera-thai-constellation'
const STORED_CART = JSON.stringify([
  { slug: PRODUCT, name: PRODUCT_NAME, price: 3490, quantity: 2 },
])

const fillContactForm = async (page: Page) => {
  await page.getByTestId('contact-name').fill('Ada')
  await page.getByTestId('contact-email').fill('ada@exemple.fr')
  await page.getByTestId('contact-message').fill('Bonjour, ce produit est-il disponible ?')
}

const productJsonLd = async (page: Page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents())
    .map((text) => JSON.parse(text) as Record<string, unknown>)
    .find((data) => data['@type'] === 'Product')

const expectNoViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
}

test.describe('Vente en ligne active', () => {
  test('la fiche garde prix et bouton d’ajout au panier, sans demande de renseignement', async ({
    page,
  }) => {
    await gotoHydrated(page, `/produit/${PRODUCT}`)

    await expect(page.getByTestId('product-price')).toBeVisible()
    await expect(page.getByTestId('add-to-cart')).toBeVisible()
    await expect(page.getByTestId('product-inquiry')).toHaveCount(0)
    expect(await productJsonLd(page)).toHaveProperty('offers')
  })

  test('/contact?produit= nomme le produit et envoie son slug avec le message', async ({
    page,
  }) => {
    await gotoHydrated(page, `/contact?produit=${PRODUCT}`)

    const line = page.getByTestId('contact-product')
    await expect(line).toHaveText(`Votre demande concerne : ${PRODUCT_NAME}`)
    await expect(line.getByRole('link', { name: PRODUCT_NAME })).toHaveAttribute(
      'href',
      `/produit/${PRODUCT}`,
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/contact$/)

    await fillContactForm(page)
    const sent = page.waitForRequest((request) => request.url().includes('/_actions/contact'))
    await page.getByTestId('contact-submit').click()

    expect((await sent).postDataBuffer()?.toString()).toMatch(
      new RegExp(`name="product"\\r\\n\\r\\n${PRODUCT}\\r\\n`),
    )
    await expect(page.getByTestId('contact-success')).toContainText(
      'Votre demande de renseignement a bien été envoyée.',
    )
  })

  test('un produit inconnu laisse le formulaire de contact simple', async ({ page }) => {
    await page.goto('/contact?produit=produit-inconnu')

    await expect(page.getByTestId('contact-submit')).toBeVisible()
    await expect(page.getByTestId('contact-product')).toHaveCount(0)
  })
})

// L'API locale vend en ligne : un faux serveur sert l'identité avec `salesEnabled: false`, relaie le reste à
// l'API et répond lui-même aux messages de contact (corps relevé), devant un second serveur du site.
test.describe('Vente en ligne coupée', () => {
  test.describe.configure({ mode: 'serial' })

  const ports = (project: string) =>
    project === 'mobile' ? { site: 3177, api: 3187 } : { site: 3176, api: 3186 }
  let siteUrl = ''
  let fakeApi: Server
  let site: ChildProcess
  const contactBodies: Record<string, unknown>[] = []

  test.beforeAll(async () => {
    const { site: sitePort, api: apiPort } = ports(test.info().project.name)
    siteUrl = `http://127.0.0.1:${sitePort}`

    fakeApi = createServer(async (request, response) => {
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(Buffer.from(chunk as Uint8Array))
      if (request.method === 'POST' && request.url === '/api/contact_messages') {
        contactBodies.push(JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>)
        response.writeHead(201, { 'content-type': 'application/json' }).end('{}')
        return
      }
      const upstream = await fetch(`${API_URL}${request.url}`)
      if (request.url === '/api/site-identity' && upstream.ok) {
        const identity = (await upstream.json()) as Record<string, unknown>
        response
          .writeHead(200, { 'content-type': 'application/json' })
          .end(JSON.stringify({ ...identity, salesEnabled: false }))
        return
      }
      response
        .writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') ?? 'application/json',
        })
        .end(Buffer.from(await upstream.arrayBuffer()))
    }).listen(apiPort, '127.0.0.1')

    site = spawn('node', ['server.mjs'], {
      env: {
        ...process.env,
        PORT: String(sitePort),
        HOST: '127.0.0.1',
        API_URL: `http://127.0.0.1:${apiPort}`,
      },
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

  test('le catalogue n’affiche ni prix, ni filtre, ni tri par prix', async ({ page, isMobile }) => {
    await gotoHydrated(page, `${siteUrl}/catalogue`)

    await expect(page.getByTestId('catalog-product').first()).toBeVisible()
    await expect(page.getByTestId('catalog-product-price')).toHaveCount(0)
    await expect(page.getByTestId('catalog-product').first()).not.toContainText('€')
    const sorts = await page
      .getByTestId('catalog-sort')
      .locator('option')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))
    expect(sorts).toEqual(['pertinence', 'nom'])

    if (isMobile) await page.getByTestId('catalog-filters-open').click()
    const filters = page.getByTestId('catalog-filters')
    await expect(filters.getByTestId('catalog-filter-exposure-soleil')).toBeVisible()
    await expect(filters.getByTestId('catalog-filter-price-min')).toHaveCount(0)
    await expect(filters.getByTestId('catalog-filter-price-max')).toHaveCount(0)
  })

  test('les paramètres de prix de l’URL sont ignorés', async ({ page }) => {
    await page.goto(`${siteUrl}/catalogue`)
    const total = await page.getByTestId('catalog-results-count').textContent()

    await page.goto(`${siteUrl}/catalogue?prix_min=1000&prix_max=2000&tri=prix-desc`)

    await expect(page.getByTestId('catalog-results-count')).toHaveText(total ?? '')
    await expect(page.getByTestId('catalog-sort')).toHaveValue('pertinence')
    await expect(page.getByTestId('catalog-active-filter')).toHaveCount(0)
  })

  test('le carrousel de l’accueil n’affiche aucun prix', async ({ page }) => {
    await page.goto(siteUrl)

    await expect(page.getByTestId('carousel-slide').first()).toBeVisible()
    await expect(page.getByTestId('home-carousel')).not.toContainText('€')
  })

  test('la fiche propose une demande de renseignement à la place du prix et du panier', async ({
    page,
  }) => {
    await gotoHydrated(page, `${siteUrl}/produit/${PRODUCT}`)

    await expect(page.getByTestId('product-title')).toHaveText(PRODUCT_NAME)
    await expect(page.getByTestId('product-price')).toHaveCount(0)
    await expect(page.getByTestId('product-page')).not.toContainText('€')
    await expect(page.getByTestId('add-to-cart')).toHaveCount(0)
    const inquiry = page.getByTestId('product-inquiry')
    await expect(inquiry).toHaveAccessibleName(`Demande de renseignement sur ${PRODUCT_NAME}`)
    await expect(inquiry).toHaveAttribute('href', `/contact?produit=${PRODUCT}`)
    expect((await inquiry.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    const jsonLd = await productJsonLd(page)
    expect(jsonLd).toHaveProperty('name', PRODUCT_NAME)
    expect(jsonLd).not.toHaveProperty('offers')
  })

  test('un produit en rupture de stock propose aussi la demande de renseignement', async ({
    page,
  }) => {
    await page.goto(`${siteUrl}/produit/${OUT_OF_STOCK}`)

    await expect(page.getByTestId('product-inquiry')).toBeVisible()
  })

  test('sans panier : lien du header absent, /panier en 404, stockage ni lu ni effacé', async ({
    page,
  }) => {
    await page.addInitScript((cart) => {
      if (!localStorage.getItem('panier')) localStorage.setItem('panier', cart)
    }, STORED_CART)
    await gotoHydrated(page, `${siteUrl}/produit/${PRODUCT}`)

    await expect(page.getByTestId('cart-link')).toHaveCount(0)
    const response = await page.goto(`${siteUrl}/panier`)
    expect(response?.status()).toBe(404)
    expect(await page.evaluate(() => localStorage.getItem('panier'))).toBe(STORED_CART)
  })

  test('la demande de renseignement mène au formulaire et envoie le produit', async ({ page }) => {
    await gotoHydrated(page, `${siteUrl}/produit/${PRODUCT}`)
    await page.getByTestId('product-inquiry').click()

    await expect(page).toHaveURL(`${siteUrl}/contact?produit=${PRODUCT}`)
    await expect(page.getByTestId('contact-product')).toHaveText(
      `Votre demande concerne : ${PRODUCT_NAME}`,
    )
    await page.waitForLoadState('networkidle')
    await fillContactForm(page)
    await page.getByTestId('contact-submit').click()

    await expect(page.getByTestId('contact-success')).toContainText(
      'Votre demande de renseignement a bien été envoyée.',
    )
    expect(contactBodies.at(-1)).toMatchObject({ name: 'Ada', product: PRODUCT })
  })

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('le lien de demande est présent et le formulaire envoie le produit', async ({ page }) => {
      await page.goto(`${siteUrl}/produit/${PRODUCT}`)
      await page.getByTestId('product-inquiry').click()

      await expect(page.getByTestId('contact-product')).toBeVisible()
      await fillContactForm(page)
      await page.getByTestId('contact-submit').click()

      await expect(page.getByTestId('contact-success')).toContainText(
        'Votre demande de renseignement a bien été envoyée.',
      )
      await expect(page.getByTestId('contact-product')).toBeVisible()
      expect(contactBodies.at(-1)).toMatchObject({ product: PRODUCT })
    })
  })

  for (const mode of MODES) {
    test(`mode ${mode} : fiche et demande de renseignement sans violation axe`, async ({
      page,
    }) => {
      await useMode(page, mode)

      for (const path of [`/produit/${PRODUCT}`, `/contact?produit=${PRODUCT}`]) {
        await gotoHydrated(page, `${siteUrl}${path}`)
        if (mode === 'enhanced') {
          await expect(page.locator('html')).toHaveAttribute('data-a11y-mode', 'enhanced')
        }
        await expectNoViolations(page)
      }
    })
  }
})
