import { expect, test } from '@playwright/test'

import { MODES } from './routes'
import { gotoHydrated, useMode } from './support'

test.describe('Menu de catégories (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'Menu en cascade réservé au desktop.')

  test('s’ouvre au clic, déploie les enfants et se ferme avec Échap', async ({ page }) => {
    await gotoHydrated(page, '/')
    const toggle = page.getByTestId('layout-category-menu-toggle')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const menu = page.getByTestId('layout-category-menu')
    await expect(menu).toBeVisible()

    const parent = menu.getByRole('link', { name: 'Plantes d’intérieur' })
    await parent.hover()
    await expect(parent).toHaveAttribute('aria-expanded', 'true')
    await expect(menu.getByRole('link', { name: 'Feuillages' })).toBeVisible()

    await menu.getByRole('link', { name: 'Feuillages' }).focus()
    await expect(menu.getByRole('link', { name: 'Monstera' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('une feuille navigue et met à jour le fil d’Ariane', async ({ page }) => {
    await gotoHydrated(page, '/')
    await page.getByTestId('layout-category-menu-toggle').click()
    const menu = page.getByTestId('layout-category-menu')

    await menu.getByRole('link', { name: 'Plantes d’extérieur' }).hover()
    await menu.getByRole('link', { name: 'Palmiers' }).click()

    await expect(page).toHaveURL(/\/catalogue\/plantes-exterieur\/palmiers$/)
    await expect(page.getByTestId('layout-breadcrumb').locator('[aria-current="page"]')).toHaveText(
      'Palmiers',
    )
    await expect(page.getByTestId('layout-category-menu')).toHaveCount(0)
  })

  for (const mode of MODES) {
    test(`le panneau est ancré à son bouton, mode ${mode}`, async ({ page }) => {
      await useMode(page, mode)
      await gotoHydrated(page, '/catalogue')
      const headerBefore = await page.locator('header').boundingBox()
      const titleBefore = await page.getByRole('heading', { level: 1 }).boundingBox()

      const toggle = page.getByTestId('layout-category-menu-toggle')
      await toggle.click()
      const menu = page.getByTestId('layout-category-menu')
      await menu.getByRole('link', { name: 'Plantes d’intérieur' }).hover()
      await menu.getByRole('link', { name: 'Feuillages' }).hover()

      const button = await toggle.boundingBox()
      const panel = await menu.boundingBox()
      expect(button && panel).toBeTruthy()
      if (!button || !panel) return

      expect(Math.abs(panel.y - (button.y + button.height))).toBeLessThan(12)
      const alignedLeft = Math.abs(panel.x - button.x) < 12
      const alignedRight = Math.abs(panel.x + panel.width - (button.x + button.width)) < 12
      expect(alignedLeft || alignedRight).toBe(true)
      expect(panel.x + panel.width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0)

      expect((await page.locator('header').boundingBox())?.height).toBe(headerBefore?.height)
      expect((await page.getByRole('heading', { level: 1 }).boundingBox())?.y).toBe(titleBefore?.y)

      await page.screenshot({ path: `screenshots/menu-catalogue-${mode}.png` })
    })
  }
})

test.describe('Menu mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'Menu latéral réservé au mobile.')

  test('descend et remonte les niveaux en déplaçant le focus', async ({ page }) => {
    await gotoHydrated(page, '/')
    const toggle = page.getByTestId('layout-mobile-menu-toggle')

    await toggle.click()
    const menu = page.getByTestId('layout-mobile-menu')
    await expect(menu).toBeVisible()

    await menu.getByRole('button', { name: 'Catalogue' }).click()
    await expect(menu.getByRole('heading', { name: 'Catalogue' })).toBeFocused()

    await menu.getByRole('button', { name: 'Plantes d’intérieur' }).click()
    await expect(menu.getByRole('heading', { name: 'Plantes d’intérieur' })).toBeFocused()
    await expect(page.getByTestId('layout-mobile-menu-back')).toHaveText(/Retour à Catalogue/)

    await page.getByTestId('layout-mobile-menu-back').click()
    await expect(menu.getByRole('heading', { name: 'Catalogue' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(toggle).toBeFocused()

    await toggle.click()
    await expect(
      page.getByTestId('layout-mobile-menu').getByRole('button', { name: 'Catalogue' }),
    ).toBeVisible()
  })

  test('le lien de la page courante porte aria-current', async ({ page }) => {
    await gotoHydrated(page, '/contact')
    await page.getByTestId('layout-mobile-menu-toggle').click()
    const menu = page.getByTestId('layout-mobile-menu')

    await expect(menu.getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(menu.getByRole('link', { name: 'Accueil' })).not.toHaveAttribute('aria-current')
  })

  test('une feuille navigue et ferme le panneau', async ({ page }) => {
    await gotoHydrated(page, '/')
    await page.getByTestId('layout-mobile-menu-toggle').click()
    const menu = page.getByTestId('layout-mobile-menu')

    await menu.getByRole('button', { name: 'Catalogue' }).click()
    await menu.getByRole('button', { name: 'Plantes aquatiques' }).click()
    await menu.getByRole('link', { name: 'Nénuphars' }).click()

    await expect(page).toHaveURL(/\/catalogue\/plantes-aquatiques\/nenuphars$/)
    await expect(page.getByTestId('layout-mobile-menu')).toHaveCount(0)
  })
})
