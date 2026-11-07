import { expect, test } from '@playwright/test'

test.describe('Accueil', () => {
  test('affiche le hero, le carrousel et les articles', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-hero')).toBeVisible()
    await expect(page.getByTestId('home-carousel')).toBeVisible()
    await expect(page.getByTestId('carousel-slide')).toHaveCount(5)
    await expect(page.getByTestId('home-carousel-error')).toHaveCount(0)
    await expect(page.getByTestId('home-blog-card')).toHaveCount(3)
    await expect(page.getByTestId('home-blog-error')).toHaveCount(0)
    await expect(page.getByTestId('home-blog-empty')).toHaveCount(0)
  })

  test('l’image du hero est prioritaire et préchargée, les articles dans le HTML initial', async ({
    request,
  }) => {
    const html = await (await request.get('/')).text()

    expect(html.match(/data-testid="home-blog-card"/g)).toHaveLength(3)
    expect(html).toMatch(
      /<link rel="preload" as="image" type="image\/avif"[^>]*fetchpriority="high"/,
    )
    expect(html).toMatch(/<img[^>]*src="\/images\/hero-1920\.webp"[^>]*fetchpriority="high"/)
    expect(html).not.toMatch(/<img[^>]*src="\/images\/hero-1920\.webp"[^>]*loading="lazy"/)
  })

  test('affiche les illustrations des articles servies par l’API', async ({ page }) => {
    await page.goto('/')
    const image = page.getByTestId('home-blog-card').first().locator('img')
    await image.scrollIntoViewIfNeeded()
    const apiOrigin = new URL(process.env.API_URL || 'http://localhost:8090').origin
    await expect(image).toHaveAttribute('src', new RegExp(`^${apiOrigin}/media/`))
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0)
  })
})

test.describe('Carrousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Îlot client:visible : il s'hydrate quand le carrousel entre dans la fenêtre.
    await page.getByTestId('home-carousel').scrollIntoViewIfNeeded()
    await expect(page.locator('.carousel-viewport')).toHaveAttribute('data-embla-ready', '')
  })

  test('Précédent est désactivé au début et Suivant fait avancer', async ({ page }) => {
    const previous = page.getByTestId('carousel-prev')
    const firstDot = page.getByTestId('carousel-dot').first()

    await expect(previous).toBeDisabled()
    await expect(firstDot).toHaveAttribute('aria-current', 'true')

    await page.getByTestId('carousel-next').click()

    await expect(previous).toBeEnabled()
    await expect(firstDot).not.toHaveAttribute('aria-current')
    await expect(page.getByTestId('carousel-dot').nth(1)).toHaveAttribute('aria-current', 'true')
  })

  test('se fait glisser à la souris', async ({ page }) => {
    const viewport = await page.locator('.carousel-viewport').boundingBox()
    expect(viewport).not.toBeNull()
    const y = (viewport?.y ?? 0) + (viewport?.height ?? 0) / 3
    const startX = (viewport?.x ?? 0) + (viewport?.width ?? 0) * 0.8

    await page.mouse.move(startX, y)
    await page.mouse.down()
    await page.mouse.move(startX - 150, y, { steps: 8 })
    await page.mouse.move(startX - 300, y, { steps: 8 })
    await page.mouse.up()

    await expect(page.getByTestId('carousel-prev')).toBeEnabled()
    // Le geste part d'une diapositive cliquable : il fait défiler sans ouvrir la fiche
    await expect(page).toHaveURL('/')
  })

  test('une diapositive ouvre la fiche de son produit', async ({ page }) => {
    const name = (
      (await page.getByTestId('carousel-slide-link').first().textContent()) ?? ''
    ).trim()
    await page.getByTestId('carousel-slide').first().click()

    await expect(page).toHaveURL(/\/produit\/[a-z0-9-]+$/)
    await expect(page.getByTestId('product-title')).toHaveText(name)
  })
})

test.describe('Carrousel, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche le message à la place des diapositives', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-carousel-error')).toContainText(
      'Impossible de charger le carrousel pour le moment.',
    )
    await expect(page.getByTestId('carousel-slide')).toHaveCount(0)
  })
})

test.describe('Carrousel, API sans diapositive (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('la section disparaît de l’accueil', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-hero')).toBeVisible()
    await expect(page.getByTestId('home-carousel')).toHaveCount(0)
    await expect(page.getByTestId('home-carousel-error')).toHaveCount(0)
  })
})

test.describe('Carrousel sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('la piste défile nativement', async ({ page }) => {
    await page.goto('/')
    const viewport = page.locator('.carousel-viewport')

    await expect(viewport).not.toHaveAttribute('data-embla-ready')
    await expect(viewport).toHaveCSS('overflow-x', 'auto')
    await viewport.hover()
    await page.mouse.wheel(600, 0)
    await expect(page.getByTestId('carousel-slide').first()).not.toBeInViewport({ ratio: 0.99 })
  })
})
