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

interface ArticleDto {
  title: string
  section: { slug: string; name: string } | null
}

test.describe('Rubriques des articles', () => {
  test('chaque carte porte sa rubrique en sur-titre, sauf sans rubrique', async ({
    page,
    request,
  }) => {
    const articles = (await (await request.get(`${API_URL}/api/articles`)).json()) as ArticleDto[]
    await page.goto('/blog')

    const cards = page.getByTestId('blog-card')
    for (const [index, article] of articles.entries()) {
      const overline = cards.nth(index).getByTestId('article-section')
      if (article.section) await expect(overline).toHaveText(article.section.name)
      else await expect(overline).toHaveCount(0)
    }
  })

  test('la carte de l’accueil porte aussi la rubrique', async ({ page, request }) => {
    const [first] = (await (await request.get(`${API_URL}/api/articles`)).json()) as ArticleDto[]
    await page.goto('/')

    await expect(
      page.getByTestId('home-blog-card').first().getByTestId('article-section'),
    ).toHaveText(first?.section?.name ?? '')
  })

  test('le filtre liste « Toutes » puis chaque rubrique, l’active marquée', async ({
    page,
    request,
  }) => {
    const sections = (await (await request.get(`${API_URL}/api/article-sections`)).json()) as {
      name: string
    }[]
    await page.goto('/blog')

    const filter = page.getByRole('navigation', { name: 'Rubriques' })
    const links = filter.getByTestId('blog-section-link')
    await expect(links).toHaveText(['Toutes', ...sections.map((section) => section.name)])
    await expect(links.first()).toHaveAttribute('aria-current', 'page')
    await expect(filter.locator('[aria-current]')).toHaveCount(1)
  })

  test('une rubrique filtre la liste par le paramètre rubrique', async ({ page, request }) => {
    const expected = (await (
      await request.get(`${API_URL}/api/articles?section=conseils`)
    ).json()) as ArticleDto[]
    await page.goto('/blog')
    await page.getByTestId('blog-section-link').filter({ hasText: 'Conseils' }).click()

    await expect(page).toHaveURL(/\/blog\?rubrique=conseils$/)
    await expect(page.getByTestId('blog-card').getByRole('heading', { level: 2 })).toHaveText(
      expected.map((article) => article.title),
    )
    await expect(page.getByTestId('article-section')).toHaveText(expected.map(() => 'Conseils'))
    const active = page.getByTestId('blog-sections').locator('[aria-current="page"]')
    await expect(active).toHaveText('Conseils')
  })

  test('une rubrique inconnue donne une liste vide, sans erreur', async ({ page }) => {
    const response = await page.goto('/blog?rubrique=inconnue')

    expect(response?.status()).toBe(200)
    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.getByTestId('blog-sections').locator('[aria-current]')).toHaveCount(0)
  })
})

test.describe('Liste des articles, API sans article (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('affiche un message amical, sans filtre de rubriques', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByTestId('blog-empty')).toBeVisible()
    await expect(page.getByTestId('blog-list')).toHaveCount(0)
    await expect(page.getByTestId('blog-sections')).toHaveCount(0)
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

  test('la relance garde la rubrique filtrée', async ({ page }) => {
    await page.goto('/blog?rubrique=conseils')

    await expect(page.getByTestId('blog-retry')).toHaveAttribute('href', '/blog?rubrique=conseils')
  })
})
