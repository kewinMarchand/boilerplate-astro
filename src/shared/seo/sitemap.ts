import { ALL_NAVIGATION } from '@/shared/config'
import { localizePath } from '@/shared/i18n'

import { absoluteUrl } from './buildPageMeta'

import type { LanguageAlternate, LocaleContext } from '@/shared/i18n'

/**
 * Une entrée par adresse et par langue : les pages fixes (même chemin dans chaque langue), puis chaque groupe
 * d'`entries` (un élément dans ses langues). À plus d'une langue, chaque entrée liste ses équivalents
 * (`xhtml:link`, `x-default` vers la langue par défaut) ; un site monolingue garde le sitemap simple.
 */
export const buildSitemapXml = (
  { locales, defaultLocale }: Pick<LocaleContext, 'locales' | 'defaultLocale'>,
  entries: LanguageAlternate[][] = [],
) => {
  const multilingual = locales.length > 1
  const url = ({ locale, path }: LanguageAlternate) =>
    absoluteUrl(localizePath(path, locale, defaultLocale))
  const link = (hreflang: string, href: string) =>
    `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`
  const links = (group: LanguageAlternate[]) => {
    if (!multilingual) return ''
    const fallback = group.find(({ locale }) => locale === defaultLocale)
    return [
      ...group.map((alternate) => link(alternate.locale, url(alternate))),
      ...(fallback ? [link('x-default', url(fallback))] : []),
    ].join('')
  }
  const fixed = ALL_NAVIGATION.map(({ href }) => locales.map((locale) => ({ locale, path: href })))
  const urls = [...fixed, ...entries].flatMap((group) =>
    group.map((alternate) => `  <url><loc>${url(alternate)}</loc>${links(group)}</url>`),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    multilingual
      ? '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
      : '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
