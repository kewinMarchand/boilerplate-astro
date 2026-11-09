import { alternatesByKey } from '@/shared/i18n'
import { buildSitemapXml } from '@/shared/seo'

import { listArticleEntries } from '@/modules/blog/index.server'
import { listCatalogAlternates, listProductEntries } from '@/modules/catalog/index.server'

import type { AppPath } from '@/shared/routing'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals }) => {
  const { locales } = locals.locale
  const byLocale = (list: (locale: string) => Promise<{ key: string; path: AppPath }[]>) =>
    Promise.all(locales.map(async (locale) => ({ locale, entries: await list(locale) })))
  const [categories, products, articles] = await Promise.all([
    listCatalogAlternates(locals.locale),
    byLocale(listProductEntries),
    byLocale(listArticleEntries),
  ])
  return new Response(
    buildSitemapXml(locals.locale, [
      ...categories,
      ...alternatesByKey(products),
      ...alternatesByKey(articles),
    ]),
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  )
}
