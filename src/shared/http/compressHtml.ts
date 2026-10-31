import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

/**
 * Pages HTML compressées à la volée (brotli, sinon gzip) : rendues à chaque requête, elles ne peuvent
 * pas être précompressées au build comme les fichiers statiques (server.mjs).
 */
export const compressHtml = async (request: Request, response: Response): Promise<Response> => {
  if (!response.headers.get('content-type')?.includes('text/html')) return response
  if (response.headers.has('content-encoding')) return response

  const accepted = request.headers.get('accept-encoding') ?? ''
  const encoding = accepted.includes('br') ? 'br' : accepted.includes('gzip') ? 'gzip' : null
  if (!encoding) return response

  const body = new Uint8Array(await response.arrayBuffer())
  const headers = new Headers(response.headers)
  headers.set('content-encoding', encoding)
  headers.append('vary', 'accept-encoding')
  headers.delete('content-length')

  return new Response(
    encoding === 'br'
      ? brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
      : gzipSync(body),
    { status: response.status, statusText: response.statusText, headers },
  )
}
