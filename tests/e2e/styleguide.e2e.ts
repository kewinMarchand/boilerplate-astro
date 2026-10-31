import { expect, test } from '@playwright/test'

const SECTIONS = [
  'couleurs',
  'typographie',
  'espacements',
  'boutons',
  'formulaires',
  'retours',
  'navigation',
  'medias',
  'icones',
  'logo',
]

test('la charte graphique présente ses dix sections', async ({ page }) => {
  const response = await page.goto('/charte-graphique')

  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1, name: 'Charte graphique' })).toBeVisible()
  for (const section of SECTIONS) {
    await expect(page.getByTestId(`styleguide-section-${section}`)).toBeVisible()
  }
  await expect(page.getByTestId('styleguide-section-couleurs')).toContainText(/Ratio \d+\.\d{2}:1/)
})
