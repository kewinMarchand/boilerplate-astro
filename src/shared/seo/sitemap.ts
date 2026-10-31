import { ALL_NAVIGATION } from '@/shared/config'

import { absoluteUrl } from './buildPageMeta'

export const buildSitemapXml = (extraPaths: string[] = []) => {
  const paths = [...ALL_NAVIGATION.map(({ href }) => href), ...extraPaths]
  const urls = paths.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`)

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
