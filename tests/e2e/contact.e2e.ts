import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

const fillValidForm = async (page: Page) => {
  await page.getByTestId('contact-name').fill('Ada')
  await page.getByTestId('contact-email').fill('ada@exemple.fr')
  await page.getByTestId('contact-message').fill('Bonjour, ceci est un message.')
}

test.describe('Contact', () => {
  test('signale chaque champ obligatoire dans son libellé', async ({ page }) => {
    await page.goto('/contact')

    for (const field of ['contact-name', 'contact-email', 'contact-message']) {
      await expect(page.getByTestId(field)).toHaveAttribute('required', '')
      await expect(page.getByTestId(field)).toHaveAccessibleName(/\(obligatoire\)$/)
    }
  })

  test('affiche les erreurs de validation quand le formulaire est vide', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-submit').click()

    const name = page.getByTestId('contact-name')
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription(/2 caractères minimum/)
    await expect(page.getByTestId('contact-success')).toHaveCount(0)
  })

  test('confirme l’envoi quand le formulaire est valide', async ({ page }) => {
    await page.goto('/contact')
    await fillValidForm(page)
    await page.getByTestId('contact-submit').click()

    await expect(page.getByTestId('contact-success')).toBeVisible()
    await expect(page.getByTestId('contact-name')).toHaveValue('')
  })

  test('affiche sous le champ la violation 422 renvoyée par l’API', async ({ page }) => {
    await page.goto('/contact')
    await fillValidForm(page)
    await page.getByTestId('contact-name').fill('A'.repeat(256))
    await page.getByTestId('contact-submit').click()

    const name = page.getByTestId('contact-name')
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toHaveAccessibleDescription('Votre nom ne doit pas dépasser 255 caractères.')
    await expect(page.getByTestId('contact-success')).toHaveCount(0)
  })
})

test.describe('Contact sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('valide côté serveur et lie les erreurs aux champs', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-submit').click()

    await expect(page.getByTestId('contact-email')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('contact-email')).toHaveAccessibleDescription(
      /adresse e-mail valide/,
    )
  })

  test('envoie le message par l’action serveur', async ({ page }) => {
    await page.goto('/contact')
    await fillValidForm(page)
    await page.getByTestId('contact-submit').click()

    await expect(page.getByTestId('contact-success')).toBeVisible()
  })
})
