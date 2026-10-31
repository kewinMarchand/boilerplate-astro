import type { Mode } from './routes'
import type { Page } from '@playwright/test'

export const useMode = async (page: Page, mode: Mode) => {
  if (mode === 'enhanced') {
    await page.addInitScript(() => localStorage.setItem('a11y-mode', 'enhanced'))
  }
  if (mode === 'dark') {
    await page.addInitScript(() => localStorage.setItem('color-scheme', 'dark'))
  }
}

export const gotoHydrated = async (page: Page, url: string) => {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}
