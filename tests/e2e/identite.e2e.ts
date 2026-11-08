import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { MODES } from './routes'
import { useMode } from './support'

import type { Page } from '@playwright/test'
import type { ChildProcess } from 'node:child_process'
import type { Server } from 'node:http'

const API_URL = process.env['API_URL'] || 'http://localhost:8090'
const LIBRARY_PRIMARY = { standard: '#1d4ed8', dark: '#9abdff', enhanced: '#1e3a8a' }

const THEME = {
  light: {
    primary: '#c2410c',
    'primary-dark': '#923109',
    'on-primary': '#ffffff',
    'primary-surface-subtle': '#faf0ec',
    'primary-surface': '#f4ddd3',
    'primary-surface-strong': '#ebc2b1',
    secondary: '#0f766e',
    'secondary-dark': '#0b5852',
    'on-secondary': '#ffffff',
    'secondary-surface-subtle': '#ecf4f3',
    'secondary-surface': '#d4e6e5',
    'secondary-surface-strong': '#b2d3d1',
  },
  dark: {
    primary: '#da8d6d',
    'primary-dark': '#eabcaa',
    'on-primary': '#0f141d',
    'primary-surface-subtle': '#1f1e23',
    'primary-surface': '#272327',
    'primary-surface-strong': '#362b2c',
    secondary: '#6fada8',
    'secondary-dark': '#abcfcc',
    'on-secondary': '#0f141d',
    'secondary-surface-subtle': '#172028',
    'secondary-surface': '#1b262e',
    'secondary-surface-strong': '#213137',
  },
}

// Rapports CSP de feuille de style inline levés par la page (la CSP est en Report-Only, rien n'est bloqué).
const inlineStyleViolations = async (page: Page, url: string) => {
  await page.addInitScript(() => {
    const store = window as unknown as { violations: string[] }
    store.violations = []
    document.addEventListener('securitypolicyviolation', (event) => {
      if (event.effectiveDirective.startsWith('style-src'))
        store.violations.push(
          `${event.effectiveDirective} ${event.blockedURI} ${event.sourceFile}:${event.lineNumber}`,
        )
    })
  })
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  return page.evaluate(() => (window as unknown as { violations: string[] }).violations)
}

const primaryOf = (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bui-color-primary').trim(),
  )

test.describe('Identité du site lue dans l’API', () => {
  test('nom de l’API dans le header et le titre, sans logo ni couleurs', async ({ page }) => {
    const response = await page.goto('/contact')
    const html = (await response?.text()) ?? ''
    const { name } = (await (await fetch(`${API_URL}/api/site-identity`)).json()) as {
      name: string
    }

    const logo = page.getByTestId('layout-logo')
    await expect(logo).toHaveAccessibleName(name)
    await expect(logo.locator('img')).toHaveAttribute('src', '/logo-mark.svg')
    await expect(page).toHaveTitle(`Contact · ${name}`)
    expect(html).not.toContain('--bui-color-')
    expect(await primaryOf(page)).toBe(LIBRARY_PRIMARY.standard)
  })

  for (const path of ['/', '/contact']) {
    test(`${path} : aucun style inline signalé par la CSP, sans couleurs`, async ({ page }) => {
      expect(await inlineStyleViolations(page, path)).toEqual([])
    })
  }

  test('le manifeste porte le nom de l’API', async ({ request }) => {
    const manifest = (await (await request.get('/manifest.webmanifest')).json()) as {
      name: string
      theme_color: string
    }
    expect(manifest.name).toBe('Boilerplate')
    expect(manifest.theme_color).toBe(LIBRARY_PRIMARY.standard)
  })
})

// L'API locale n'a ni logo ni couleurs : un faux serveur sert une identité complète et relaie le reste à l'API,
// devant un second serveur du site (build de production) qui le prend pour API.
test.describe('Identité administrée avec logo et couleurs', () => {
  test.describe.configure({ mode: 'serial' })

  const ports = (project: string) =>
    project === 'mobile' ? { site: 3173, api: 3183 } : { site: 3172, api: 3182 }
  let siteUrl = ''
  let fakeApi: Server
  let site: ChildProcess

  test.beforeAll(async () => {
    const { site: sitePort, api: apiPort } = ports(test.info().project.name)
    const apiUrl = `http://127.0.0.1:${apiPort}`
    siteUrl = `http://127.0.0.1:${sitePort}`
    const logo = readFileSync('public/icon-192.png')

    fakeApi = createServer(async (request, response) => {
      if (request.url === '/logo.png') {
        response.writeHead(200, { 'content-type': 'image/png' }).end(logo)
        return
      }
      if (request.url === '/api/site-identity') {
        const defaultColorScheme = request.headers['x-scenario'] === 'sombre' ? 'dark' : 'auto'
        response.writeHead(200, { 'content-type': 'application/json' }).end(
          JSON.stringify({
            name: 'Oraki',
            tagline: 'Plantes rares et tropicales, livrées chez vous, en France métropolitaine.',
            logo: { alt: 'Oraki', width: 192, height: 192, sources: [], src: `${apiUrl}/logo.png` },
            defaultColorScheme,
            theme: THEME,
          }),
        )
        return
      }
      const upstream = await fetch(`${API_URL}${request.url}`)
      response
        .writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') ?? 'application/json',
        })
        .end(Buffer.from(await upstream.arrayBuffer()))
    }).listen(apiPort, '127.0.0.1')

    site = spawn('node', ['server.mjs'], {
      env: { ...process.env, PORT: String(sitePort), HOST: '127.0.0.1', API_URL: apiUrl },
      stdio: 'ignore',
    })
    await expect
      .poll(async () => (await fetch(siteUrl).catch(() => null))?.status, { timeout: 15_000 })
      .toBe(200)
  })

  test.afterAll(() => {
    site.kill()
    fakeApi.close()
  })

  test('le logo remplace le pictogramme et le nom dans le header', async ({ page }) => {
    await page.goto(siteUrl)

    const logo = page.getByTestId('layout-logo')
    await expect(logo).toHaveAccessibleName('Oraki')
    await expect(logo).not.toContainText('Oraki')
    const image = logo.getByRole('img', { name: 'Oraki' })
    await expect(image).toHaveAttribute('fetchpriority', 'high')
    expect((await image.boundingBox())?.height).toBe(40)
    await expect(logo.locator('img[src="/logo-mark.svg"]')).toHaveCount(0)
    await expect(page.getByTestId('home-hero').getByRole('heading', { level: 1 })).toHaveText(
      'Oraki',
    )
    await expect(page).toHaveTitle('Oraki')
  })

  test('les couleurs de marque, autorisées par la CSP, suivent le clair et le sombre', async ({
    page,
  }) => {
    const response = await page.goto(siteUrl)
    const csp = (await response?.allHeaders())?.['content-security-policy-report-only'] ?? ''
    expect(csp).toMatch(/style-src [^;]*'sha256-[A-Za-z0-9+/]+=*'/)
    expect(await primaryOf(page)).toBe(THEME.light.primary)

    await page.emulateMedia({ colorScheme: 'dark' })
    expect(await primaryOf(page)).toBe(THEME.dark.primary)

    const manifest = (await (await page.request.get(`${siteUrl}/manifest.webmanifest`)).json()) as {
      theme_color: string
    }
    expect(manifest.theme_color).toBe(THEME.light.primary)
  })

  for (const path of ['/', '/contact']) {
    test(`${path} : aucun style inline signalé par la CSP, avec couleurs`, async ({ page }) => {
      expect(await inlineStyleViolations(page, `${siteUrl}${path}`)).toEqual([])
    })
  }

  for (const mode of MODES) {
    test(`mode ${mode} : jeton principal et axe WCAG 2.1 AA`, async ({ page }) => {
      await useMode(page, mode)
      await page.goto(`${siteUrl}/contact`)

      const expected = { standard: THEME.light.primary, dark: THEME.dark.primary }
      expect(await primaryOf(page)).toBe(
        mode === 'enhanced' ? LIBRARY_PRIMARY.enhanced : expected[mode],
      )
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  }

  test('le thème par défaut de l’API est servi, le choix mémorisé l’emporte', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'X-Scenario': 'sombre' })
    await page.goto(siteUrl)
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark')

    await page.evaluate(() => localStorage.setItem('color-scheme', 'light'))
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'light')
  })

  test('avec un défaut sombre, « système » est mémorisé et revient au rechargement', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ 'X-Scenario': 'sombre' })
    await page.goto(siteUrl)
    await page.waitForLoadState('networkidle')
    await page.getByTestId('color-scheme-toggle').click()
    await page.getByTestId('color-scheme-option-auto').click()
    expect(await page.evaluate(() => localStorage.getItem('color-scheme'))).toBe('auto')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'auto')
  })
})
