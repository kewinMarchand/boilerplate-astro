import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { MODES } from './routes'
import { useMode } from './support'

import type { Page } from '@playwright/test'

const CATALOG = '/catalogue'

const firstCard = (page: Page) => page.getByTestId('catalog-product').first()

/** Nom commun aux variantes AVIF et WebP de l'image de la première carte (sans largeur ni extension). */
const firstImageStem = async (page: Page) => {
  await page.goto(CATALOG)
  const src = (await firstCard(page).locator('img').getAttribute('src')) ?? ''
  const box = await firstCard(page).boundingBox()
  return { stem: src.replace(/-\d+\.\w+$/, ''), box }
}

const failImage = (page: Page, stem: string) =>
  page.route(
    (url) => url.href.startsWith(stem),
    (route) => route.fulfill({ status: 404 }),
  )

test.describe('Image de l’API en échec', () => {
  test('la carte garde ses dimensions sur un fond de remplacement, image invisible', async ({
    page,
  }) => {
    const { stem, box } = await firstImageStem(page)
    await failImage(page, stem)
    await page.goto(CATALOG)

    const picture = firstCard(page).locator('picture')
    await expect(picture).toHaveAttribute('data-image-error', '')
    await expect(picture.locator('img')).toHaveCSS('opacity', '0')
    await expect(picture.locator('img')).toHaveAttribute('alt', /.+/)
    expect(await firstCard(page).boundingBox()).toEqual(box)
  })

  test('une image chargée ne porte pas la marque', async ({ page }) => {
    await page.goto(CATALOG)
    await page.waitForLoadState('networkidle')

    await expect(firstCard(page).locator('picture')).toHaveClass(/bui-picture/)
    await expect(page.locator('[data-image-error]')).toHaveCount(0)
    await expect(firstCard(page).locator('img')).toHaveCSS('opacity', '1')
  })

  for (const mode of MODES) {
    test(`mode ${mode} : aucune violation axe avec une image en échec`, async ({ page }) => {
      const { stem } = await firstImageStem(page)
      await useMode(page, mode)
      await failImage(page, stem)
      await page.goto(CATALOG)
      await expect(firstCard(page).locator('picture')).toHaveAttribute('data-image-error', '')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }
})
