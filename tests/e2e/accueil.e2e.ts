import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

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

test.describe('Grille des articles', () => {
  const cardBoxes = async (page: Page) => {
    const cards = page.getByTestId('home-blog-card')
    await expect(cards).toHaveCount(3)
    const box = async (index: number) => {
      const found = await cards.nth(index).boundingBox()
      expect(found).not.toBeNull()
      return found ?? { x: 0, y: 0, width: 0, height: 0 }
    }
    return [await box(0), await box(1), await box(2)] as const
  }

  test('l’image de l’article à la une annonce sa taille d’affichage aux points de rupture', async ({
    page,
  }) => {
    await page.goto('/')
    const cards = page.getByTestId('home-blog-card')

    await expect(cards.first().locator('source').first()).toHaveAttribute(
      'sizes',
      '(min-width: 1024px) 66vw, 100vw',
    )
    await expect(cards.nth(1).locator('source').first()).toHaveAttribute(
      'sizes',
      '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
    )
  })

  test('desktop : l’article à la une sur 8 colonnes, les deux autres empilés à droite', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Largeur desktop pilotée explicitement.')
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    const [featured, second, third] = await cardBoxes(page)

    expect(featured.width / second.width).toBeGreaterThan(1.8)
    expect(featured.width / second.width).toBeLessThan(2.3)
    expect(second.x).toBeGreaterThan(featured.x + featured.width)
    expect(third.x).toBeCloseTo(second.x, 0)
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
  })

  test('tablette : l’article à la une et les deux autres sur la même largeur, côte à côte', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Largeur tablette pilotée explicitement.')
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    const [featured, second, third] = await cardBoxes(page)

    expect(featured.width).toBeCloseTo(second.width, 0)
    expect(second.x).toBeGreaterThan(featured.x + featured.width)
    expect(featured.y).toBeCloseTo(second.y, 0)
    expect(third.x).toBeCloseTo(second.x, 0)
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
  })

  test('mobile : les trois articles empilés sur la même largeur', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Disposition mobile.')
    await page.goto('/')
    const [featured, second, third] = await cardBoxes(page)

    expect(second.width).toBeCloseTo(featured.width, 0)
    expect(third.width).toBeCloseTo(featured.width, 0)
    expect(second.x).toBeCloseTo(featured.x, 0)
    expect(second.y).toBeGreaterThanOrEqual(featured.y + featured.height)
    expect(third.y).toBeGreaterThanOrEqual(second.y + second.height)
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

  test('les diapositives débordent du contenu sans faire défiler la page', async ({ page }) => {
    const section = await page.getByTestId('home-carousel').boundingBox()
    const slideRights = await page
      .getByTestId('carousel-slide')
      .evaluateAll((slides) => slides.map((slide) => slide.getBoundingClientRect().right))

    expect(Math.max(...slideRights)).toBeGreaterThan((section?.x ?? 0) + (section?.width ?? 0))
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
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
