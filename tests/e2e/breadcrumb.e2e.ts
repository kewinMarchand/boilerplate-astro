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
    await page.goto('/mentions-legales')
    const breadcrumb = page.getByTestId('layout-breadcrumb')

    await expect(breadcrumb.getByRole('listitem')).toHaveText(['Accueil', 'Mentions légales'])
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText('Mentions légales')
    await expect(breadcrumb.getByRole('link')).toHaveCount(1)
  })

  test('produit un JSON-LD BreadcrumbList cohérent avec le fil visible', async ({ page }) => {
    await page.goto('/mentions-legales')

    const breadcrumbList = (await readJsonLd(page)).find(
      (data) => data['@type'] === 'BreadcrumbList',
    )
    const items = breadcrumbList?.itemListElement as { position: number; item: string }[]
    expect(items).toHaveLength(2)
    expect(items.map((item) => item.position)).toEqual([1, 2])
    expect(items[1]?.item).toMatch(/^http:\/\/localhost:3170\/mentions-legales$/)
  })

  test('la 404 affiche « Accueil › Page introuvable »', async ({ page }) => {
    await page.goto('/route-inexistante')
    await expect(page.getByTestId('layout-breadcrumb').getByRole('listitem')).toHaveText([
      'Accueil',
      'Page introuvable',
    ])
  })
})
