import node from '@astrojs/node'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import { precompress } from './tools/precompress.ts'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
  output: 'server',
  // Mode middleware : server.mjs sert les fichiers statiques précompressés, puis confie le reste à Astro.
  adapter: node({ mode: 'middleware' }),
  integrations: [svelte(), precompress()],
  server: { port: 4321, host: true },
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    // Dépendance Git : compilée dans le serveur, pour que l'image de production n'ait pas à l'installer.
    ssr: { noExternal: ['@kewinmarchand/csp'] },
  },
})
