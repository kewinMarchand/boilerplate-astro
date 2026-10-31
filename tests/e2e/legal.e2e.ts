import { expect, test } from '@playwright/test'

import { STATIC_ROUTES } from './routes'

test.describe('Pages légales', () => {
  test('n’affiche pas la mesure d’audience sans Matomo', async ({ page }) => {
    await page.goto('/donnees-personnelles')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('legal-audience-measurement')).toHaveCount(0)
  })

  test('le plan du site liste toutes les routes', async ({ page }) => {
    await page.goto('/plan-du-site')

    for (const route of STATIC_ROUTES) {
      await expect(page.getByTestId('legal-sitemap').locator(`a[href="${route}"]`)).toHaveCount(1)
    }
  })

  test('la déclaration d’accessibilité est non conforme sans audit', async ({ page }) => {
    await page.goto('/accessibilite')

    await expect(
      page.getByRole('heading', { level: 1, name: "Déclaration d'accessibilité" }),
    ).toBeVisible()
    await expect(page.getByTestId('legal-compliance-status')).toContainText('non conforme')
    await expect(page.getByTestId('legal-compliance-status')).toContainText(
      'aucun audit n’a encore été réalisé',
    )
    await expect(
      page
        .getByRole('navigation', { name: 'Liens légaux' })
        .getByRole('link', { name: 'Accessibilité : non conforme' }),
    ).toBeVisible()
  })
})
