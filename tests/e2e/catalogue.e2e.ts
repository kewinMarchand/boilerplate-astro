import { expect, test } from '@playwright/test'

import { gotoHydrated } from './support'

import type { Page } from '@playwright/test'

const openFilters = async (page: Page, isMobile: boolean) => {
  if (isMobile) await page.getByTestId('catalog-filters-open').click()
  return page.getByTestId('catalog-filters')
}

const prices = async (page: Page) =>
  (await page.getByTestId('catalog-product-price').allTextContents()).map((text) =>
    Number(text.replace(/[^\d,]/g, '').replace(',', '.')),
  )

test.describe('Catalogue', () => {
  test('filtrer par exposition met à jour l’URL, le compteur et les puces', async ({
    page,
    isMobile,
  }) => {
    await gotoHydrated(page, '/catalogue')
    await expect(page.getByTestId('catalog-results-count')).toHaveText('24 produits')
    await expect(page.getByTestId('catalog-active-filters')).toHaveCount(0)

    const filters = await openFilters(page, isMobile)
    await filters.getByTestId('catalog-filter-exposure-ombre').check()

    await expect(page).toHaveURL(/\/catalogue\?exposition=ombre$/)
    await expect(page.getByTestId('catalog-results-count')).toHaveText('3 produits')
    await expect(page.getByTestId('catalog-filter-exposure-ombre')).toBeFocused()
    if (isMobile) await page.keyboard.press('Escape')

    const chip = page.getByTestId('catalog-active-filter')
    await expect(chip).toHaveText(/Ombre/)
    await chip.click()
    await expect(page).toHaveURL(/\/catalogue$/)
    await expect(page.getByTestId('catalog-active-filters')).toHaveCount(0)
    await expect(page.locator('#page-title')).toBeFocused()
  })

  test('« Tout effacer » garde la catégorie et la vue', async ({ page }) => {
    await gotoHydrated(page, '/catalogue/plantes-exterieur?taille=L&tri=nom&vue=liste')
    await page.getByTestId('catalog-clear-filters').first().click()

    await expect(page).toHaveURL(/\/catalogue\/plantes-exterieur\?vue=liste$/)
    await expect(page.locator('#page-title')).toBeFocused()
  })

  test('le tri par prix croissant ordonne les produits', async ({ page }) => {
    await gotoHydrated(page, '/catalogue?exposition=soleil')
    await page.getByTestId('catalog-sort').selectOption('prix-asc')

    await expect(page).toHaveURL(/exposition=soleil&tri=prix-asc/)
    await expect.poll(async () => (await prices(page)).slice(0, 2)).toEqual([14.9, 18.9])
  })

  test('la pagination passe en page 2 puis revient', async ({ page }) => {
    await gotoHydrated(page, '/catalogue?vue=liste')
    const pagination = page.getByTestId('catalog-pagination')

    await pagination.getByRole('link', { name: 'Page 2' }).click()
    await expect(page).toHaveURL(/vue=liste&page=2$/)
    await expect(pagination.locator('[aria-current="page"]')).toHaveText(/2/)
    await expect(page.getByTestId('catalog-product')).toHaveCount(12)
    await expect(page.locator('#page-title')).toBeFocused()

    await pagination.getByRole('link', { name: 'Précédent' }).click()
    await expect(page).toHaveURL(/\/catalogue\?vue=liste$/)
  })

  test('la vue liste est conservée par les filtres', async ({ page, isMobile }) => {
    await gotoHydrated(page, '/catalogue')
    await page.getByTestId('catalog-view-list').click()
    await expect(page.getByTestId('catalog-view-list')).toHaveAttribute('aria-current', 'page')

    const filters = await openFilters(page, isMobile)
    await filters.getByTestId('catalog-filter-size-S').check()
    await expect(page).toHaveURL(/taille=S&vue=liste/)
  })

  test('affiche l’état vide avec « Tout effacer »', async ({ page }) => {
    await page.goto('/catalogue/plantes-aquatiques?exposition=ombre')

    await expect(page.getByTestId('catalog-empty')).toBeVisible()
    await expect(page.getByTestId('catalog-product')).toHaveCount(0)
    await expect(
      page.getByTestId('catalog-empty').getByTestId('catalog-clear-filters'),
    ).toBeVisible()
  })

  test('le panneau de filtres mobile se ferme avec Échap et rend le focus', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Panneau réservé au mobile.')
    await gotoHydrated(page, '/catalogue')
    const trigger = page.getByTestId('catalog-filters-open')

    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    await trigger.click()
    await expect(page.getByRole('dialog', { name: 'Filtres' })).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe('Catalogue sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('le formulaire GET applique les filtres', async ({ page }) => {
    await page.goto('/catalogue?tri=prix-desc')
    const filters = page.getByTestId('catalog-filters')

    await filters.getByTestId('catalog-filter-in-stock').check()
    await filters.getByTestId('catalog-filter-price-max').fill('30')
    await filters.getByRole('button', { name: 'Appliquer les filtres' }).click()

    await expect(page).toHaveURL(/en_stock=1/)
    const params = new URL(page.url()).searchParams
    expect(params.get('prix_max')).toBe('30')
    expect(params.get('tri')).toBe('prix-desc')
    await expect(page.getByTestId('catalog-active-filter')).toHaveCount(2)
  })
})

test.describe('Catalogue, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche l’erreur et la relance', async ({ page }) => {
    await page.goto('/catalogue')

    await expect(page.getByTestId('catalog-error')).toBeVisible()
    await expect(page.getByTestId('catalog-retry')).toBeVisible()
  })
})

test.describe('Catalogue, API sans données (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('affiche le message de liste vide', async ({ page }) => {
    await page.goto('/catalogue')

    await expect(page.getByTestId('catalog-empty')).toBeVisible()
    await expect(page.getByTestId('catalog-error')).toHaveCount(0)
  })
})
