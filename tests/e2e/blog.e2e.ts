import { expect, test } from '@playwright/test'

const API_URL = process.env.API_URL || 'http://localhost:8090'

test.describe('Liste des articles', () => {
  test('affiche les articles de l’API, rendus côté serveur', async ({ page, request }) => {
    const articles = (await (await request.get(`${API_URL}/api/articles`)).json()) as {
      title: string
    }[]
    const html = await (await request.get('/blog')).text()
    expect(html.match(/data-testid="blog-card"/g)).toHaveLength(articles.length)

    await page.goto('/blog')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
    await expect(page.getByTestId('layout-breadcrumb').getByRole('listitem')).toHaveText([
      'Accueil',
      'Blog',
    ])
    await expect(
      page.getByTestId('blog-list').getByTestId('blog-card').getByRole('heading', { level: 2 }),
    ).toHaveText(articles.map((article) => article.title))
    await expect(page.getByTestId('blog-list').getByRole('heading', { level: 3 })).toHaveCount(0)
    await expect(page.getByTestId('blog-empty')).toHaveCount(0)
    await expect(page.getByTestId('blog-error')).toHaveCount(0)
  })

  test('une carte ouvre sa fiche, dont le fil d’Ariane ramène à la liste', async ({ page }) => {
    await page.goto('/blog')
    const card = page.getByTestId('blog-card').first()
    const title = (await card.getByRole('heading', { level: 2 }).textContent()) ?? ''
    await card.getByRole('link').click()

    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/)
    await expect(page.getByTestId('article-title')).toHaveText(title.trim())
    await page.getByTestId('layout-breadcrumb').getByRole('link', { name: 'Blog' }).click()
    await expect(page).toHaveURL(/\/blog$/)
  })

  test('le lien « Tous les articles » de l’accueil mène à la liste', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('home-blog-all').click()

    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.getByTestId('blog-list')).toBeVisible()
  })

  test('déclare Blog et BreadcrumbList en JSON-LD', async ({ page }) => {
    await page.goto('/blog')

    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => (JSON.parse(text) as { '@type': string })['@type'],
    )
    expect(types).toEqual(expect.arrayContaining(['Blog', 'BreadcrumbList']))
  })

  test('figure dans le sitemap', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/blog</loc>')
  })
})

test.describe('Liste des articles, API sans article (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('affiche un message amical', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.getByTestId('blog-list')).toHaveCount(0)
  })
})

test.describe('Liste des articles, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche un message et un bouton de relance', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')
    await expect(page.getByTestId('blog-error')).toBeVisible()
    await expect(page.getByTestId('blog-retry')).toHaveAttribute('href', '/blog')
    await expect(page.getByTestId('blog-list')).toHaveCount(0)
  })
})
