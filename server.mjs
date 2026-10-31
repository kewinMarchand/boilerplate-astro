// Serveur de production : fichiers statiques précompressés (tools/precompress.ts), puis rendu par Astro.
// L'adaptateur Node d'Astro ne compresse rien ; sans ce serveur, le catalogue tombait sous 0,90 sur Lighthouse.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

import { handler } from './dist/server/entry.mjs'

const CLIENT = fileURLToPath(new URL('./dist/client', import.meta.url))
const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}
const ENCODINGS = [
  ['br', '.br'],
  ['gzip', '.gz'],
]

const staticFile = (pathname) => {
  const path = join(CLIENT, normalize(decodeURIComponent(pathname)))
  if (!path.startsWith(CLIENT) || !existsSync(path) || !statSync(path).isFile()) return null
  return path
}

const serveStatic = (req, res, path, pathname) => {
  const accepted = req.headers['accept-encoding'] ?? ''
  const encoding = ENCODINGS.find(
    ([name, ext]) => accepted.includes(name) && existsSync(path + ext),
  )
  res.setHeader('content-type', TYPES[extname(path)] ?? 'application/octet-stream')
  res.setHeader('vary', 'accept-encoding')
  if (pathname.startsWith('/_astro/'))
    res.setHeader('cache-control', 'public, max-age=31536000, immutable')
  if (encoding) res.setHeader('content-encoding', encoding[0])
  createReadStream(encoding ? path + encoding[1] : path).pipe(res)
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost')
  const path = req.method === 'GET' || req.method === 'HEAD' ? staticFile(pathname) : null
  if (path) serveStatic(req, res, path, pathname)
  else handler(req, res)
}).listen(Number(process.env.PORT ?? 3000), process.env.HOST ?? '0.0.0.0', () => {
  // « listening » : motif d'attente de Lighthouse CI (startServerReadyPattern).
  process.stdout.write(
    `Serveur listening on http://${process.env.HOST ?? '0.0.0.0'}:${process.env.PORT ?? 3000}\n`,
  )
})
