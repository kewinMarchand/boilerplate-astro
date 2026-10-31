import { expect, test } from '@playwright/test'

import { ROUTES } from './routes'

for (const route of ROUTES) {
  test(`la page ${route} répond 200 sans erreur console`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })

    const response = await page.goto(route)

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('le footer reste collé en bas du viewport sur une page courte', async ({ page }) => {
  await page.goto('/route-inexistante')

  const footer = await page.getByTestId('app-footer').boundingBox()
  const viewport = page.viewportSize()

  expect(footer).not.toBeNull()
  expect(Math.round((footer?.y ?? 0) + (footer?.height ?? 0))).toBe(viewport?.height)
})
