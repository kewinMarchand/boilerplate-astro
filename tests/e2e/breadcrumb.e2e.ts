import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

const readJsonLd = async (page: Page) =>
  Promise.all(
    (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (text) => JSON.parse(text) as Record<string, unknown>,
    ),
  )

test.describe('Fil d’Ariane', () => {
  test('est absent de l’accueil', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('layout-breadcrumb')).toHaveCount(0)
  })

  test('est présent sur une page interne, dernier élément en aria-current', async ({ page }) => {
    await page.goto('/catalogue/plantes-interieur/feuillages')
    const breadcrumb = page.getByTestId('layout-breadcrumb')

    await expect(breadcrumb.getByRole('listitem')).toHaveText([
      'Accueil',
      'Catalogue',
      'Plantes d’intérieur',
      'Feuillages',
    ])
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText('Feuillages')
    await expect(breadcrumb.getByRole('link')).toHaveCount(3)
  })

  test('produit un JSON-LD BreadcrumbList cohérent avec le fil visible', async ({ page }) => {
    await page.goto('/catalogue/plantes-interieur/feuillages')

    const breadcrumbList = (await readJsonLd(page)).find(
      (data) => data['@type'] === 'BreadcrumbList',
    )
    const items = breadcrumbList?.itemListElement as { position: number; item: string }[]
    expect(items).toHaveLength(4)
    expect(items.map((item) => item.position)).toEqual([1, 2, 3, 4])
    expect(items[3]?.item).toMatch(
      /^http:\/\/localhost:4100\/catalogue\/plantes-interieur\/feuillages$/,
    )
  })

  test('la 404 affiche « Accueil › Page introuvable »', async ({ page }) => {
    await page.goto('/route-inexistante')
    await expect(page.getByTestId('layout-breadcrumb').getByRole('listitem')).toHaveText([
      'Accueil',
      'Page introuvable',
    ])
  })
})
