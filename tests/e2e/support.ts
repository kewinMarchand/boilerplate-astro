import type { Mode } from './routes'
import type { Page } from '@playwright/test'
import type { Server } from 'node:http'

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

/** Écoute sur un port libre choisi par le système (API factices des scénarios) et le renvoie. */
export const listenOnFreePort = (server: Server) =>
  new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve(typeof address === 'object' && address !== null ? address.port : 0)
    })
  })
