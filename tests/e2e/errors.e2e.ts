import { expect, test } from '@playwright/test'

const TECHNICAL_WORDS = /Error|stack|undefined|Internal|failed/

test.describe('Pages d’erreur', () => {
  for (const url of ['/route-inexistante']) {
    test(`${url} répond 404 avec la page introuvable`, async ({ page }) => {
      const response = await page.goto(url)

      expect(response?.status()).toBe(404)
      await expect(page.getByRole('heading', { level: 1, name: 'Page introuvable' })).toBeVisible()
      await expect(page.getByTestId('error-home-link')).toHaveAttribute('href', '/')
      await expect(page.getByTestId('error-sitemap-link')).toBeVisible()
      await expect(page.getByTestId('error-catalog-link')).toBeVisible()
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    })
  }

  test('la route de test répond 500 avec un message neutre', async ({ page }) => {
    const response = await page.goto('/erreur-test')

    expect(response?.status()).toBe(500)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Une erreur est survenue' }),
    ).toBeVisible()
    await expect(page.getByTestId('error-retry')).toBeVisible()
    await expect(page.locator('main')).not.toContainText(TECHNICAL_WORDS)
  })
})
