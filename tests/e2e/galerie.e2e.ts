import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

const API_URL = process.env['API_URL'] || 'http://localhost:8090'
const PRODUCT = 'strelitzia-reginae'

interface ImageDto {
  src: string
}

const imagesOf = async (slug: string) => {
  const product = (await (await fetch(`${API_URL}/api/products/${slug}`)).json()) as {
    image: ImageDto
    gallery: ImageDto[]
  }
  return [product.image, ...product.gallery].map((image) => image.src)
}

// Hydratée, la galerie remplace les liens des vignettes par des boutons.
const gotoGallery = async (page: Page, slug: string) => {
  await page.goto(`/produit/${slug}`)
  await expect(page.getByTestId('product-gallery').getByRole('button').first()).toBeVisible()
}

test.describe('Galerie de la fiche produit', () => {
  test('affiche l’image principale puis une vignette par image, la première courante', async ({
    page,
  }) => {
    const sources = await imagesOf(PRODUCT)
    await gotoGallery(page, PRODUCT)

    const gallery = page.getByTestId('product-gallery')
    const main = page.getByTestId('product-gallery-main').locator('img')
    await expect(main).toHaveAttribute('src', sources[0] ?? '')
    await expect(main).toHaveAttribute('fetchpriority', 'high')
    const thumbs = gallery.getByTestId('product-gallery-thumb')
    await expect(thumbs).toHaveCount(sources.length)
    await expect(thumbs.first()).toHaveAccessibleName(`Voir l'image 1 sur ${sources.length}`)
    await expect(thumbs.first()).toHaveAttribute('aria-current', 'true')
    await expect(thumbs.nth(1)).not.toHaveAttribute('aria-current')
    await expect(thumbs.first().locator('img')).toHaveAttribute('loading', 'lazy')
  })

  test('une vignette cliquée remplace l’image affichée', async ({ page }) => {
    const sources = await imagesOf(PRODUCT)
    await gotoGallery(page, PRODUCT)

    const thumbs = page.getByTestId('product-gallery-thumb')
    await thumbs.nth(2).click()

    await expect(page.getByTestId('product-gallery-main').locator('img')).toHaveAttribute(
      'src',
      sources[2] ?? '',
    )
    await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true')
    await expect(thumbs.first()).not.toHaveAttribute('aria-current')
  })

  test('les flèches du clavier passent d’une vignette à l’autre, en boucle', async ({ page }) => {
    const sources = await imagesOf(PRODUCT)
    await gotoGallery(page, PRODUCT)

    const thumbs = page.getByTestId('product-gallery-thumb')
    const main = page.getByTestId('product-gallery-main').locator('img')
    await thumbs.first().focus()
    await page.keyboard.press('ArrowRight')

    await expect(thumbs.nth(1)).toBeFocused()
    await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true')
    await expect(main).toHaveAttribute('src', sources[1] ?? '')

    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(thumbs.last()).toBeFocused()
    await expect(main).toHaveAttribute('src', sources.at(-1) ?? '')
  })

  test('une autre fiche a sa propre galerie', async ({ page }) => {
    const sources = await imagesOf('monstera-deliciosa')
    await page.goto('/produit/monstera-deliciosa')

    await expect(page.getByTestId('product-gallery-thumb')).toHaveCount(sources.length)
  })

  test('sans galerie, la fiche garde son image seule', async ({ page }) => {
    await page.goto('/produit/monstera-adansonii')

    await expect(page.getByTestId('product-page')).toBeVisible()
    await expect(page.getByTestId('product-gallery')).toHaveCount(0)
    await expect(page.getByTestId('product-page').locator('img').first()).toHaveAttribute(
      'fetchpriority',
      'high',
    )
  })
})

test.describe('Galerie sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('les vignettes sont des liens vers l’image en grand', async ({ page }) => {
    await page.goto(`/produit/${PRODUCT}`)

    const thumbs = page.getByTestId('product-gallery-thumb')
    await expect(thumbs.first()).toHaveAttribute('href', /^https?:\/\/.+\.webp$/)
    await expect(page.getByTestId('product-gallery').locator('button')).toHaveCount(0)
  })
})
