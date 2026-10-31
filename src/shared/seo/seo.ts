import type { AppPath } from '@/shared/routing'

export declare namespace Seo {
  type JsonLd = Record<string, unknown>

  interface BreadcrumbItem {
    label: string
    path: AppPath
  }

  interface Image {
    path: string
    width: number
    height: number
    alt: string
  }

  interface Input {
    title?: string | undefined
    description: string
    path: string
    canonicalPath?: string | undefined
    noindex?: boolean | undefined
    image?: Image | undefined
    breadcrumb?: BreadcrumbItem[] | undefined
    jsonLd?: JsonLd[] | undefined
    prevPath?: string | undefined
    nextPath?: string | undefined
  }

  interface Meta {
    title: string
    description: string
    canonical: string
    robots: string
    siteName: string
    locale: string
    ogTitle: string
    image: Image & { url: string }
    jsonLd: JsonLd[]
    prev: string | undefined
    next: string | undefined
  }
}
