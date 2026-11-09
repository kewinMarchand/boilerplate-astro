import { SITE } from '@/shared/config'
import { localizePath, ogLocale } from '@/shared/i18n'
import { largestWebp } from '@/shared/ui/kit'

import type { Seo } from './seo'
import type { SiteIdentity } from '@/shared/config'
import type { LocaleContext } from '@/shared/i18n'

export const DEFAULT_SHARE_IMAGE: Seo.Image = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Jardin tropical, illustration du site',
}

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href

/** Adresse absolue d'un chemin sans préfixe, dans la langue de la page. */
export const localizedUrl = (
  path: string,
  { locale, defaultLocale }: Pick<LocaleContext, 'locale' | 'defaultLocale'>,
) => absoluteUrl(localizePath(path, locale, defaultLocale))

export const buildBreadcrumbJsonLd = (
  items: Seo.BreadcrumbItem[],
  locale: LocaleContext,
): Seo.JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: localizedUrl(item.path, locale),
  })),
})

export const buildHomeJsonLd = (
  { name: siteName, icon }: Pick<SiteIdentity, 'name' | 'icon'>,
  locale: LocaleContext,
  languageTag: string,
): Seo.JsonLd[] => [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: localizedUrl('/', locale),
    logo: icon?.png512 ?? absoluteUrl('/icon-512.png'),
    email: SITE.publisher.email,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: localizedUrl('/', locale),
    inLanguage: languageTag,
  },
]

const toShareImage = (image: SiteIdentity['shareImage'], siteName: string): Seo.Image =>
  image
    ? {
        path: largestWebp(image),
        width: image.width,
        height: image.height,
        alt: image.alt || siteName,
      }
    : DEFAULT_SHARE_IMAGE

/** `hreflang` de chaque langue où la page existe, plus `x-default` vers la langue par défaut (site multilingue). */
const buildHreflang = ({ locale, alternates }: Seo.Languages) => {
  if (locale.locales.length < 2) return []
  const links = alternates.map((alternate) => ({
    hreflang: alternate.locale,
    href: localizedUrl(alternate.path, { ...locale, locale: alternate.locale }),
  }))
  const fallback = links.find((link) => link.hreflang === locale.defaultLocale)
  return fallback ? [...links, { ...fallback, hreflang: 'x-default' }] : links
}

/** Identité du site lue dans l'API (ou repli sur la configuration) : nom et image de partage par défaut. */
export const buildPageMeta = (
  input: Seo.Input,
  { name: siteName, shareImage }: Pick<SiteIdentity, 'name' | 'shareImage'>,
  languages: Seo.Languages,
): Seo.Meta => {
  const { locale } = languages
  const image = input.image ?? toShareImage(shareImage, siteName)
  const breadcrumbJsonLd = input.breadcrumb ? [buildBreadcrumbJsonLd(input.breadcrumb, locale)] : []
  const hreflang = buildHreflang(languages)

  return {
    title: input.metaTitle || (input.title ? `${input.title} · ${siteName}` : siteName),
    description: input.metaDescription || input.description,
    canonical: localizedUrl(input.canonicalPath ?? input.path, locale),
    robots: input.noindex ? 'noindex, follow' : 'index, follow',
    siteName,
    locale: ogLocale(locale.locale),
    alternateLocales: hreflang
      .map((link) => link.hreflang)
      .filter((code) => code !== 'x-default' && code !== locale.locale)
      .map(ogLocale),
    hreflang,
    ogTitle: input.metaTitle || (input.title ?? siteName),
    image: { ...image, url: absoluteUrl(image.path) },
    jsonLd: [...breadcrumbJsonLd, ...(input.jsonLd ?? [])],
    prev: input.prevPath && localizedUrl(input.prevPath, locale),
    next: input.nextPath && localizedUrl(input.nextPath, locale),
    ogType: input.publishedTime ? 'article' : 'website',
    publishedTime: input.publishedTime,
  }
}
