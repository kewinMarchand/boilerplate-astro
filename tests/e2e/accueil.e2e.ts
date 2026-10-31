import { expect, test } from '@playwright/test'

test.describe('Accueil', () => {
  test('affiche le hero et le carrousel', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-hero')).toBeVisible()
    await expect(page.getByTestId('home-carousel')).toBeVisible()
    await expect(page.getByTestId('carousel-slide')).toHaveCount(5)
  })

  test('l’image du hero est prioritaire et préchargée', async ({ request }) => {
    const html = await (await request.get('/')).text()

    expect(html).toMatch(
      /<link rel="preload" as="image" type="image\/avif"[^>]*fetchpriority="high"/,
    )
    expect(html).toMatch(/<img[^>]*src="\/images\/hero-1920\.webp"[^>]*fetchpriority="high"/)
    expect(html).not.toMatch(/<img[^>]*src="\/images\/hero-1920\.webp"[^>]*loading="lazy"/)
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
