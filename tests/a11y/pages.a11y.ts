import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { ROUTES } from '../e2e/routes'

for (const route of ROUTES) {
  test(`${route} ne présente aucune violation axe WCAG 2.1 AA`, async ({ page }) => {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}
