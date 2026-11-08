import { SITE } from '@/shared/config'

import type { Seo } from './seo'

export const DEFAULT_SHARE_IMAGE: Seo.Image = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Jardin tropical, illustration du site',
}

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href

export const buildBreadcrumbJsonLd = (items: Seo.BreadcrumbItem[]): Seo.JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: absoluteUrl(item.path),
  })),
})

export const buildHomeJsonLd = (siteName: string): Seo.JsonLd[] => [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/icon-512.png'),
    email: SITE.publisher.email,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl('/'),
    inLanguage: 'fr-FR',
  },
]

/** `siteName` : nom de l'identité du site (API, ou repli sur la configuration). */
export const buildPageMeta = (input: Seo.Input, siteName: string): Seo.Meta => {
  const image = input.image ?? DEFAULT_SHARE_IMAGE
  const breadcrumbJsonLd = input.breadcrumb ? [buildBreadcrumbJsonLd(input.breadcrumb)] : []

  return {
    title: input.title ? `${input.title} · ${siteName}` : siteName,
    description: input.description,
    canonical: absoluteUrl(input.canonicalPath ?? input.path),
    robots: input.noindex ? 'noindex, follow' : 'index, follow',
    siteName,
    locale: SITE.locale,
    ogTitle: input.title ?? siteName,
    image: { ...image, url: absoluteUrl(image.path) },
    jsonLd: [...breadcrumbJsonLd, ...(input.jsonLd ?? [])],
    prev: input.prevPath && absoluteUrl(input.prevPath),
    next: input.nextPath && absoluteUrl(input.nextPath),
    ogType: input.publishedTime ? 'article' : 'website',
    publishedTime: input.publishedTime,
  }
}
