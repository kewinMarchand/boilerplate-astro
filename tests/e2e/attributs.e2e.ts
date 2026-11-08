import { expect, test } from '@playwright/test'

import { gotoHydrated } from './support'

test.describe('Attributs de produit', () => {
  test('la facette d’un attribut filtre le catalogue et met à jour l’URL et les puces', async ({
    page,
    isMobile,
  }) => {
    await gotoHydrated(page, '/catalogue')
    if (isMobile) await page.getByTestId('catalog-filters-open').click()
    const filter = page
      .getByTestId('catalog-filters')
      .getByTestId('catalog-filter-attribute-feuillage-caduc')
    await expect(filter).not.toBeChecked()
    await filter.check()

    await expect(page).toHaveURL(/\/catalogue\?attr-feuillage=caduc$/)
    await expect(page.getByTestId('catalog-results-count')).toHaveText('2 produits')
    await expect(filter).toBeFocused()
    if (isMobile) await page.keyboard.press('Escape')

    const chip = page.getByTestId('catalog-active-filter')
    await expect(chip).toHaveText(/Feuillage : Caduc/)
    await chip.click()
    await expect(page).toHaveURL(/\/catalogue$/)
    await expect(page.getByTestId('catalog-results-count')).toHaveText('24 produits')
  })

  test('« Tout effacer » retire l’attribut et remet la page à 1', async ({ page }) => {
    await gotoHydrated(page, '/catalogue?attr-feuillage=persistant&vue=liste')
    await expect(page.getByTestId('catalog-results-count')).toHaveText('6 produits')

    await page.getByTestId('catalog-clear-filters').first().click()
    await expect(page).toHaveURL(/\/catalogue\?vue=liste$/)
  })

  test.describe('sans JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('le formulaire GET applique la facette', async ({ page }) => {
      await page.goto('/catalogue/plantes-aquatiques')
      const filters = page.getByTestId('catalog-filters')

      await filters.getByTestId('catalog-filter-attribute-feuillage-caduc').check()
      await filters.getByRole('button', { name: 'Appliquer les filtres' }).click()

      await expect(page).toHaveURL(/\/catalogue\/plantes-aquatiques\?attr-feuillage=caduc/)
      await expect(page.getByTestId('catalog-results-count')).toHaveText('2 produits')
      await expect(page.getByTestId('catalog-active-filter')).toHaveText(/Feuillage : Caduc/)
    })
  })

  test('aucune facette d’attribut dans une catégorie dont les produits n’en portent pas', async ({
    page,
  }) => {
    await page.goto('/catalogue/plantes-interieur/plantes-a-fleurs/anthurium')

    await expect(page.getByTestId('catalog-results-count')).toHaveText('3 produits')
    await expect(page.locator('[data-testid^="catalog-filter-attribute-"]')).toHaveCount(0)
  })

  test('la fiche liste les attributs renseignés, avec leur unité', async ({ page }) => {
    await page.goto('/produit/monstera-deliciosa')

    const attributes = page.getByTestId('product-attributes')
    await expect(attributes.locator('dt')).toHaveText(['Feuillage', 'Hauteur adulte'])
    await expect(attributes.locator('dd')).toHaveText(['Persistant', '300 cm'])
  })

  test('la fiche d’un produit sans attribut n’a pas de liste d’attributs', async ({ page }) => {
    await page.goto('/produit/anthurium-clarinervium')

    await expect(page.getByTestId('product-title')).toBeVisible()
    await expect(page.getByTestId('product-attributes')).toHaveCount(0)
  })
})
