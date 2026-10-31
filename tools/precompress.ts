import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

import type { AstroIntegration } from 'astro'

const COMPRESSIBLE = new Set([
  '.css',
  '.js',
  '.mjs',
  '.svg',
  '.json',
  '.webmanifest',
  '.txt',
  '.xml',
])

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })

/** Écrit à côté de chaque fichier statique compressible ses variantes .br et .gz, servies par server.mjs. */
export const precompress = (): AstroIntegration => ({
  name: 'precompress',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const compressible = files(dir.pathname).filter((path) => COMPRESSIBLE.has(extname(path)))
      for (const path of compressible) {
        const content = readFileSync(path)
        writeFileSync(
          `${path}.br`,
          brotliCompressSync(content, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }),
        )
        writeFileSync(`${path}.gz`, gzipSync(content, { level: 9 }))
      }
      logger.info(`${compressible.length} fichiers statiques précompressés (brotli et gzip).`)
    },
  },
})
