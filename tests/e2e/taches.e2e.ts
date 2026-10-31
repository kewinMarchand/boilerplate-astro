import { expect, test } from '@playwright/test'

test.describe('Tâches', () => {
  test('affiche la liste chargée dans le navigateur', async ({ page }) => {
    await page.goto('/taches')

    await expect(page.getByTestId('tasks-list')).toBeVisible()
    await expect(page.getByTestId('tasks-item')).toHaveCount(3)
  })

  test("n'affiche ni erreur ni liste vide quand les données sont là", async ({ page }) => {
    await page.goto('/taches')

    await expect(page.getByTestId('tasks-list')).toBeVisible()
    await expect(page.getByTestId('tasks-error')).toHaveCount(0)
    await expect(page.getByTestId('tasks-empty')).toHaveCount(0)
  })
})

test.describe('Tâches, API en erreur (X-Scenario: error)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'error' } })

  test('affiche l’erreur et la relance, sans liste', async ({ page }) => {
    await page.goto('/taches')

    await expect(page.getByTestId('tasks-error')).toBeVisible()
    await expect(page.getByTestId('tasks-retry')).toBeVisible()
    await expect(page.getByTestId('tasks-list')).toHaveCount(0)
  })
})

test.describe('Tâches, API sans données (X-Scenario: empty)', () => {
  test.use({ extraHTTPHeaders: { 'X-Scenario': 'empty' } })

  test('affiche le message de liste vide', async ({ page }) => {
    await page.goto('/taches')

    await expect(page.getByTestId('tasks-empty')).toBeVisible()
    await expect(page.getByTestId('tasks-list')).toHaveCount(0)
  })
})
