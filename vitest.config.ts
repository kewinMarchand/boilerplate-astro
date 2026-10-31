/// <reference types="vitest/config" />

import { svelteTesting } from '@testing-library/svelte/vite'
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  plugins: [svelteTesting()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
  },
})
