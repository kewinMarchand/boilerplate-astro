import { expect, test } from '@playwright/test'

import { gotoHydrated } from './support'

test.describe('Navigation', () => {
  test('le logo mène à l’accueil et porte aria-current sur l’accueil', async ({ page }) => {
    await page.goto('/')
    const logo = page.getByTestId('layout-logo')

    await expect(logo).toHaveAttribute('href', '/')
    await expect(logo).toHaveAccessibleName('Boilerplate Astro')
    await expect(logo).toHaveAttribute('aria-current', 'page')
  })

  test('le lien d’évitement mène au contenu principal', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')

    const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' })
    await expect(skipLink).toBeFocused()
    await skipLink.press('Enter')
    await expect(page).toHaveURL(/#main$/)
  })

  test('le footer mène aux quatre pages légales', async ({ page }) => {
    await page.goto('/')

    const legal = page.getByRole('navigation', { name: 'Liens légaux' })
    await expect(legal.getByRole('link')).toHaveCount(4)
    await legal.getByRole('link', { name: 'Mentions légales' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Mentions légales' })).toBeVisible()
  })
})

test.describe('Header mobile compact', () => {
  test('tient sur une ligne avec deux boutons icône nommés', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Header compact réservé au mobile.')
    await gotoHydrated(page, '/')

    const header = await page.locator('header').boundingBox()
    const logo = page.getByTestId('layout-logo')
    const menu = page.getByTestId('layout-mobile-menu-toggle')
    const a11y = page.getByTestId('a11y-mode-toggle')

    await expect(menu).toHaveAccessibleName('Menu')
    await expect(a11y).toHaveAccessibleName('Accessibilité renforcée')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(a11y).toHaveAttribute('aria-pressed', 'false')

    const boxes = await Promise.all([logo, menu, a11y].map((locator) => locator.boundingBox()))
    for (const box of boxes) {
      expect(box).not.toBeNull()
      expect(box?.y ?? 0).toBeGreaterThanOrEqual(header?.y ?? 0)
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
        (header?.y ?? 0) + (header?.height ?? 0),
      )
    }
    for (const box of boxes.slice(1)) {
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    }
    expect((boxes[1]?.x ?? 0) > (boxes[0]?.x ?? 0)).toBe(true)
    expect((boxes[2]?.x ?? 0) > (boxes[1]?.x ?? 0)).toBe(true)

    await menu.click()
    await expect(page.getByTestId('layout-mobile-menu')).toBeVisible()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
  })

  test('n’affiche pas le bouton Menu sur desktop, où le libellé reste visible', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Vérification desktop.')
    await gotoHydrated(page, '/')

    await expect(page.getByTestId('layout-mobile-menu-toggle')).toBeHidden()
    await expect(page.getByTestId('a11y-mode-toggle')).toHaveText('Accessibilité renforcée')
  })
})
