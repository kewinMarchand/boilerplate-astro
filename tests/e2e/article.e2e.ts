import { expect, test } from '@playwright/test'

const ARTICLE = '/blog/un-carrousel-accessible-sans-dependance'

test.describe('Fiche article', () => {
  test('s’ouvre depuis une carte de l’accueil', async ({ page }) => {
    await page.goto('/')

    const card = page.getByTestId('home-blog-card').first()
    const title = (await card.locator('h3').textContent()) ?? ''
    await card.getByRole('link').click()

    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/)
    await expect(page.getByTestId('article-title')).toHaveText(title)
  })

  test('affiche le titre, la date, l’image de l’API et le texte rendu côté serveur', async ({
    page,
    request,
  }) => {
    const html = await (await request.get(ARTICLE)).text()
    expect(html).toContain('<h2>Partir du défilement natif</h2>')

    await page.goto(ARTICLE)
    await expect(page.getByTestId('article-title')).toHaveText(
      'Un carrousel accessible sans dépendance',
    )
    await expect(page.getByTestId('article-page').locator('time').first()).toHaveAttribute(
      'datetime',
      '2026-09-22',
    )
    await expect(page.getByTestId('article-body').locator('li')).toHaveCount(3)
    const image = page.getByTestId('article-page').locator('img').first()
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
    await expect(page.getByTestId('layout-breadcrumb').getByRole('listitem')).toHaveText([
      'Accueil',
      'Blog',
      'Un carrousel accessible sans dépendance',
    ])
    await expect(
      page.getByTestId('article-page').getByRole('link', { name: 'Tous les articles' }),
    ).toHaveAttribute('href', '/blog')
  })

  test('expose ses données structurées d’article', async ({ page }) => {
    await page.goto(ARTICLE)

    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('article')
    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => (JSON.parse(text) as { '@type': string })['@type'],
    )
    expect(types).toEqual(expect.arrayContaining(['BlogPosting', 'BreadcrumbList']))
  })

  test('affiche rubrique, format et lecteur audio avec durée et intervenant', async ({ page }) => {
    await page.goto(ARTICLE)

    const article = page.getByTestId('article-page')
    await expect(article.getByTestId('article-section')).toHaveText('Conseils')
    await expect(article.getByTestId('article-section')).toHaveAttribute(
      'href',
      '/blog?rubrique=conseils',
    )
    const audio = article.getByTestId('article-audio')
    await expect(audio).toHaveAttribute('controls', '')
    await expect(audio).toHaveAttribute('preload', 'none')
    await expect(audio).not.toHaveAttribute('autoplay')
    await expect(audio.locator('source')).toHaveAttribute('src', /^https?:\/\/.+\.mp3$/)
    await expect(article.locator('figcaption time')).toHaveText('4 s')
    await expect(article.getByTestId('article-speaker')).toHaveText(
      'Présenté par Hina Teriierooiterai',
    )
    await expect(article.getByTestId('article-format')).toHaveCount(0)
  })

  test('le fichier audio se charge, autorisé par la CSP', async ({ page }) => {
    const response = await page.goto(ARTICLE)
    const csp = (await response?.allHeaders())?.['content-security-policy-report-only'] ?? ''
    const src =
      (await page.getByTestId('article-audio').locator('source').getAttribute('src')) ?? ''

    expect(csp).toContain(`media-src 'self' ${new URL(src).origin}`)
    expect((await page.request.get(src)).headers()['content-type']).toMatch(/^audio\//)
  })

  test('affiche le format avec la rubrique', async ({ page }) => {
    await page.goto('/blog/pourquoi-rendre-le-contenu-cote-serveur')

    await expect(page.getByTestId('article-section')).toHaveText('Conseils')
    await expect(page.getByTestId('article-format')).toHaveText('Guide')
    await expect(page.getByTestId('article-audio')).toHaveCount(0)
  })

  test('sans audio ni format, ni lecteur ni format', async ({ page }) => {
    await page.goto('/blog/le-mode-accessibilite-renforcee')

    await expect(page.getByTestId('article-section')).toHaveText('Actualités')
    await expect(page.getByTestId('article-format')).toHaveCount(0)
    await expect(page.getByTestId('article-audio')).toHaveCount(0)
    await expect(page.getByTestId('article-speaker')).toHaveCount(0)
  })

  test('répond 404 pour un article inconnu', async ({ page }) => {
    const response = await page.goto('/blog/article-inconnu')

    expect(response?.status()).toBe(404)
  })
})
