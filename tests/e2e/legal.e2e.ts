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

  test("les mentions légales affichent le texte de l'API, section par section", async ({
    page,
  }) => {
    await page.goto('/mentions-legales')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mentions légales')
    await expect(page.getByTestId('legal-section')).toHaveCount(4)
    await expect(page.getByTestId('legal-section').first()).toContainText('Exemple SAS')
    await expect(page.getByTestId('legal-error')).toHaveCount(0)
  })

  test('la déclaration d’accessibilité est non conforme sans audit', async ({ page }) => {
    await page.goto('/accessibilite')

    await expect(
      page.getByRole('heading', { level: 1, name: "Déclaration d'accessibilité" }),
    ).toBeVisible()
    const compliance = page.getByTestId('legal-section').first()
    await expect(compliance).toContainText('non conforme')
    await expect(compliance).toContainText("Aucun audit n'a encore été réalisé.")
    await expect(
      page
        .getByRole('navigation', { name: 'Liens légaux' })
        .getByRole('link', { name: 'Accessibilité : non conforme' }),
    ).toBeVisible()
  })
})

test.describe('Pages légales, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  for (const { path, title } of [
    { path: '/mentions-legales', title: 'Mentions légales' },
    { path: '/donnees-personnelles', title: 'Données personnelles' },
    { path: '/accessibilite', title: "Déclaration d'accessibilité" },
  ]) {
    test(`${path} garde son titre et affiche le message d'erreur`, async ({ page }) => {
      await page.goto(path)

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
      await expect(page.getByTestId('legal-error')).toContainText(
        'Impossible de charger cette page pour le moment. Réessayez dans quelques minutes.',
      )
      await expect(page.getByTestId('legal-section')).toHaveCount(0)
    })
  }
})
