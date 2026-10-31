import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { MODES, ROUTES } from '../e2e/routes'
import { gotoHydrated, useMode } from '../e2e/support'

import type { Page } from '@playwright/test'

const EXTRA_ROUTES = [
  '/catalogue?exposition=mi-ombre&taille=M&vue=liste',
  '/route-inexistante',
  '/erreur-test',
  '/charte-graphique',
]

const expectNoViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
}

for (const mode of MODES) {
  test.describe(`mode ${mode}`, () => {
    test.beforeEach(async ({ page }) => {
      await useMode(page, mode)
    })

    for (const route of [...ROUTES, ...EXTRA_ROUTES]) {
      test(`${route} ne présente aucune violation axe WCAG 2.1 AA`, async ({ page }) => {
        await page.goto(route)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        if (mode === 'enhanced') {
          await expect(page.locator('html')).toHaveAttribute('data-a11y-mode', 'enhanced')
        }
        await expectNoViolations(page)
      })
    }

    test('le menu ouvert ne présente aucune violation axe', async ({ page, isMobile }) => {
      await gotoHydrated(page, '/')
      if (isMobile) {
        await page.getByTestId('layout-mobile-menu-toggle').click()
        await page
          .getByTestId('layout-mobile-menu')
          .getByRole('button', { name: 'Catalogue' })
          .click()
      } else {
        await page.getByTestId('layout-category-menu-toggle').click()
        await page
          .getByTestId('layout-category-menu')
          .getByRole('link', { name: 'Plantes d’intérieur' })
          .hover()
      }
      await expectNoViolations(page)
    })
  })
}
