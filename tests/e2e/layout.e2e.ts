import { expect, test } from '@playwright/test'

import { MODES, ROUTES } from './routes'
import { gotoHydrated, useMode } from './support'

const WIDTHS = [375, 768, 1280] as const
const SCREENSHOT_ROUTES = { accueil: '/', catalogue: '/catalogue' } as const

test.describe('Mise en page', () => {
  test.skip(({ isMobile }) => isMobile, 'Les largeurs sont pilotées explicitement.')

  for (const mode of MODES) {
    for (const width of WIDTHS) {
      test(`aucun débordement horizontal à ${width} px, mode ${mode}`, async ({ page }) => {
        await useMode(page, mode)
        await page.setViewportSize({ width, height: 900 })

        for (const route of ROUTES) {
          await page.goto(route)
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          )
          expect(overflow, `${route} déborde de ${overflow} px`).toBeLessThanOrEqual(0)
        }

        for (const [name, route] of Object.entries(SCREENSHOT_ROUTES)) {
          await gotoHydrated(page, route)
          await page.screenshot({
            path: `screenshots/${name}-${mode}-${width}.png`,
            fullPage: true,
          })
        }
      })
    }
  }

  test('le mode renforcé ne déforme pas l’en-tête ni ne décale le titre', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    const measure = async (route: string) => {
      await page.goto(route)
      const header = await page.locator('header').boundingBox()
      const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
      return { header: header?.height ?? 0, heading: heading?.y ?? 0 }
    }

    for (const route of ROUTES) {
      const standard = await measure(route)
      await page.evaluate(() => localStorage.setItem('a11y-mode', 'enhanced'))
      const enhanced = await measure(route)
      await page.evaluate(() => localStorage.removeItem('a11y-mode'))

      expect(enhanced.header, `${route} : hauteur d’en-tête`).toBeLessThanOrEqual(
        standard.header * 1.4,
      )
      expect(enhanced.heading, `${route} : position du titre`).toBeLessThanOrEqual(
        standard.heading * 1.4,
      )
    }
  })
})
