import { expect, test } from '@playwright/test'

test.describe('Accueil', () => {
  test('répond et porte un seul h1', async ({ page }) => {
    const response = await page.goto('/')

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })
})
