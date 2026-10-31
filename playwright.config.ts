import { defineConfig, devices } from '@playwright/test'

const PORT = 3170
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testMatch: /.*\.(e2e|a11y)\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'fr-FR',
    testIdAttribute: 'data-testid',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `PUBLIC_SITE_URL=${BASE_URL} yarn build && PORT=${PORT} HOST=127.0.0.1 DEV_ROUTES=1 yarn start`,
    url: BASE_URL,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
})
