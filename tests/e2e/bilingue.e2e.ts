import { spawn } from 'node:child_process'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { en } from '@/shared/i18n/dictionaries/en'

import { MODES } from './routes'
import { gotoHydrated, useMode } from './support'

import type { Page } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'

/**
 * Fixtures de l'API (contrat, section 29) : `X-Scenario: bilingual` active `en` après `fr`, avec ces
 * traductions (produit, article, catégories, accroche) ; tout le reste retombe sur le français.
 */
const PRODUCT = { fr: '/produit/monstera-deliciosa', en: '/en/produit/swiss-cheese-plant' }
const ARTICLE = {
  fr: '/blog/le-mode-accessibilite-renforcee',
  en: '/en/blog/enhanced-accessibility-mode',
}
const CATEGORY = {
  fr: '/catalogue/plantes-interieur/feuillages',
  en: '/en/catalogue/indoor-plants/foliage-plants',
}
const TAGLINE_EN = 'Website template with boilerplates-ui, equipped for QA and end-to-end testing.'

const EN_ROUTES = [
  '/en',
  '/en/catalogue',
  CATEGORY.en,
  PRODUCT.en,
  '/en/blog',
  ARTICLE.en,
  '/en/contact',
  '/en/taches',
  '/en/mentions-legales',
  '/en/plan-du-site',
  '/en/panier',
  '/en/route-inexistante',
]

const hreflangs = (page: Page) =>
  page
    .locator('link[rel="alternate"][hreflang]')
    .evaluateAll((links) =>
      Object.fromEntries(
        links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
      ),
    )

const metaContent = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute('content')

test.describe('Site monolingue (fixtures, sans scénario)', () => {
  test('aucun sélecteur de langue, ni hreflang, ni og:locale:alternate', async ({ page }) => {
    await gotoHydrated(page, PRODUCT.fr)

    await expect(page.getByTestId('product-title')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByTestId('layout-languages')).toHaveCount(0)
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
    await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveCount(0)
  })

  test('un préfixe de langue non activée répond 404', async ({ page }) => {
    const response = await page.goto(PRODUCT.en)

    expect(response?.status()).toBe(404)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })
})

test.describe('Site bilingue fr, en (API_SCENARIO=bilingual)', () => {
  test.describe.configure({ mode: 'serial' })

  let appUrl = ''
  let app: ChildProcess | undefined

  // Variable lue à l'exécution : le build de la suite principale, servi sur les ports du bloc du dépôt (section 7
  // de la spec commune), que les deux API autorisent en CORS : le navigateur les appelle directement.
  test.beforeAll(async () => {
    const port = test.info().project.name === 'mobile' ? 4103 : 4102
    appUrl = `http://localhost:${port}`
    app = spawn('node', ['server.mjs'], {
      env: {
        ...process.env,
        PORT: String(port),
        HOST: '127.0.0.1',
        PUBLIC_SITE_URL: appUrl,
        API_SCENARIO: 'bilingual',
      },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(appUrl).catch(() => null))?.status, { timeout: 15_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    app?.kill()
  })

  const goto = (page: Page, path: string) => gotoHydrated(page, `${appUrl}${path}`)

  test('l’accueil anglais est préfixé, en anglais, et ses liens internes gardent le préfixe', async ({
    page,
  }) => {
    await goto(page, '/en')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByTestId('home-hero')).toContainText(TAGLINE_EN)
    await expect(page.getByTestId('home-tasks-link')).toHaveText(en.home.tasksLink)
    await expect(page.getByTestId('home-tasks-link')).toHaveAttribute('href', '/en/taches')
    await expect(page.getByTestId('home-blog-all')).toHaveText(en.blog.all)
    await expect(page.getByTestId('home-blog-all')).toHaveAttribute('href', '/en/blog')
    await expect(page.getByTestId('layout-logo')).toHaveAttribute('href', '/en')
  })

  test('la fiche produit anglaise sert le contenu, les libellés et le fil d’Ariane en anglais', async ({
    page,
  }) => {
    await goto(page, PRODUCT.en)

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByTestId('product-title')).toHaveText('Swiss cheese plant')
    await expect(page.getByTestId('product-page')).toContainText(en.product.availability)
    await expect(page.getByTestId('product-price')).toHaveText('€34.90')
    await expect(page.getByTestId('add-to-cart')).toHaveText(en.cart.add)
    const breadcrumb = page.getByTestId('layout-breadcrumb')
    await expect(breadcrumb.getByRole('link').first()).toHaveText(en.nav.home)
    await expect(breadcrumb.getByRole('link').nth(1)).toHaveAttribute('href', '/en/catalogue')
    await expect(breadcrumb).toContainText('Indoor plants')
  })

  test('une ligne du panier prend le nom et le lien de la langue de la page', async ({ page }) => {
    await goto(page, PRODUCT.en)
    await page.getByTestId('add-to-cart').click()
    await expect(page.getByTestId('add-to-cart-status')).toContainText('Swiss cheese plant')

    await goto(page, '/panier')
    await expect(page.getByTestId('cart-line-link')).toHaveText('Monstera deliciosa')
    await expect(page.getByTestId('cart-line-link')).toHaveAttribute('href', PRODUCT.fr)

    await goto(page, '/en/panier')
    await expect(page.getByTestId('cart-line-link')).toHaveText('Swiss cheese plant')
    await expect(page.getByTestId('cart-line-link')).toHaveAttribute('href', PRODUCT.en)
  })

  test('le sélecteur mène à l’équivalent de la fiche dans l’autre langue', async ({ page }) => {
    await goto(page, PRODUCT.en)
    const french = page.getByTestId('layout-language-fr')

    await expect(page.getByTestId('layout-languages')).toHaveAttribute(
      'aria-label',
      en.layout.languages,
    )
    await expect(page.getByTestId('layout-language-en')).toHaveAttribute('aria-current', 'true')
    await expect(french).toHaveText('Français')
    await expect(french).toHaveAttribute('lang', 'fr')
    await expect(french).toHaveAttribute('hreflang', 'fr')
    await expect(french).toHaveAttribute('href', PRODUCT.fr)
    await expect(french).not.toHaveAttribute('aria-current')

    await french.click()
    await expect(page).toHaveURL(`${appUrl}${PRODUCT.fr}`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByTestId('product-title')).toHaveText('Monstera deliciosa')
    await expect(page.getByTestId('layout-language-fr')).toHaveAttribute('aria-current', 'true')
    await expect(page.getByTestId('layout-language-en')).toHaveAttribute('href', PRODUCT.en)
    await expect(page.getByTestId('layout-language-en')).toHaveText('English')
  })

  test('le sélecteur garde la catégorie et l’article dans l’autre langue', async ({ page }) => {
    await goto(page, CATEGORY.fr)
    await expect(page.getByTestId('layout-language-en')).toHaveAttribute('href', CATEGORY.en)

    await goto(page, CATEGORY.en)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Foliage plants')
    await expect(page.getByTestId('layout-language-fr')).toHaveAttribute('href', CATEGORY.fr)
    await expect(page.getByTestId('catalog-product-link').first()).toHaveAttribute(
      'href',
      /^\/en\/produit\//,
    )

    await goto(page, ARTICLE.en)
    await expect(page.getByTestId('article-title')).toHaveText('The enhanced accessibility mode')
    await expect(page.getByTestId('layout-language-fr')).toHaveAttribute('href', ARTICLE.fr)
  })

  test('sans équivalent (page introuvable), le sélecteur mène à l’accueil de chaque langue', async ({
    page,
  }) => {
    for (const path of ['/en/route-inexistante', '/en/produit/monstera-deliciosa']) {
      const response = await page.goto(`${appUrl}${path}`)

      expect(response?.status()).toBe(404)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(en.errors.notFoundTitle)
      await expect(page.getByTestId('layout-language-fr')).toHaveAttribute('href', '/')
      await expect(page.getByTestId('layout-language-en')).toHaveAttribute('href', '/en')
    }
  })

  test('la navigation et les filtres entre pages anglaises gardent le préfixe', async ({
    page,
    isMobile,
  }) => {
    await goto(page, '/en')
    await page.getByTestId('home-tasks-link').click()

    await expect(page).toHaveURL(`${appUrl}/en/taches`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(en.tasks.title)
    await expect(page.getByTestId('tasks-list')).toBeVisible()

    await goto(page, '/en/catalogue')
    if (isMobile) await page.getByTestId('catalog-filters-open').click()
    await page.getByTestId('catalog-filter-exposure-ombre').check()
    await expect(page).toHaveURL(`${appUrl}/en/catalogue?exposition=ombre`)
    // La puce de boilerplates-ui préfixe son nom d'un libellé écrit en dur en français (suivi)
    await expect(page.getByTestId('catalog-active-filter')).toContainText(
      en.catalog.exposures.ombre,
    )
    await expect(page.getByTestId('catalog-product-link').first()).toHaveAttribute(
      'href',
      /^\/en\/produit\//,
    )
  })

  test('hreflang, x-default, canonique et og:locale suivent la langue de la page', async ({
    page,
  }) => {
    await goto(page, PRODUCT.en)

    expect(await hreflangs(page)).toEqual({
      fr: `${appUrl}${PRODUCT.fr}`,
      en: `${appUrl}${PRODUCT.en}`,
      'x-default': `${appUrl}${PRODUCT.fr}`,
    })
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${appUrl}${PRODUCT.en}`,
    )
    expect(await metaContent(page, 'meta[property="og:locale"]')).toBe('en_US')
    expect(await metaContent(page, 'meta[property="og:locale:alternate"]')).toBe('fr_FR')

    await goto(page, '/contact')
    expect(await hreflangs(page)).toEqual({
      fr: `${appUrl}/contact`,
      en: `${appUrl}/en/contact`,
      'x-default': `${appUrl}/contact`,
    })
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  })

  test('les données structurées déclarent la langue de la page', async ({ page }) => {
    await goto(page, ARTICLE.en)
    const posting = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((text) => JSON.parse(text) as { '@type': string; inLanguage?: string; url?: string })
      .find((item) => item['@type'] === 'BlogPosting')

    expect(posting).toMatchObject({ inLanguage: 'en-US', url: `${appUrl}${ARTICLE.en}` })
  })

  test('le sitemap liste chaque adresse dans chaque langue, avec ses équivalents', async ({
    request,
  }) => {
    const sitemap = await (await request.get(`${appUrl}/sitemap.xml`)).text()

    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(sitemap).toContain(`<loc>${appUrl}${PRODUCT.en}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}${PRODUCT.fr}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}${CATEGORY.en}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}${ARTICLE.en}</loc>`)
    expect(sitemap).toContain(`<loc>${appUrl}/en/contact</loc>`)
    expect(sitemap).toContain(`hreflang="en" href="${appUrl}${PRODUCT.en}"`)
    expect(sitemap).toContain(`hreflang="x-default" href="${appUrl}${PRODUCT.fr}"`)
  })

  test('le contact anglais valide et confirme en anglais', async ({ page }) => {
    await goto(page, '/en/contact')
    await page.getByTestId('contact-email').fill('ada')
    await page.getByTestId('contact-name').focus()
    await expect(page.getByTestId('contact-email')).toHaveAccessibleDescription(
      en.contact.validation.email,
    )

    await page.getByTestId('contact-name').fill('Ada')
    await page.getByTestId('contact-email').fill('ada@example.com')
    await page.getByTestId('contact-message').fill('Does this plant like low light?')
    await page.getByTestId('contact-submit').click()

    // L'alerte de boilerplates-ui préfixe son texte d'un libellé écrit en dur en français (suivi)
    await expect(page.getByTestId('contact-success')).toContainText(en.contact.sent)
  })

  test('sans JavaScript, le contact anglais revient sous son préfixe avec les erreurs en anglais', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`${appUrl}/en/contact`)
    await page.getByTestId('contact-name').fill('Ada')
    await page.getByTestId('contact-email').fill('ada')
    await page.getByTestId('contact-submit').click()

    await expect(page).toHaveURL(new RegExp(`^${appUrl}/en/contact\\?`))
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByTestId('contact-email')).toHaveAccessibleDescription(
      en.contact.validation.email,
    )
    await expect(page.getByTestId('contact-name')).toHaveValue('Ada')
    await context.close()
  })

  for (const path of ['/de/contact', '/fr/contact', '/en/produit/monstera-deliciosa']) {
    test(`${path} répond 404`, async ({ page }) => {
      const response = await page.goto(`${appUrl}${path}`)

      expect(response?.status()).toBe(404)
    })
  }

  for (const mode of MODES) {
    for (const path of EN_ROUTES) {
      test(`${path} en mode ${mode} ne présente aucune violation axe WCAG 2.1 AA`, async ({
        page,
      }) => {
        await useMode(page, mode)
        await goto(page, path)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        expect(results.violations).toEqual([])
      })
    }
  }
})
