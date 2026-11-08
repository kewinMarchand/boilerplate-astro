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

  /** Pages fixes dont titre et description se saisissent dans l'admin (spec commune, section 26). */
  type PageKey =
    | 'home'
    | 'catalog'
    | 'blog'
    | 'contact'
    | 'sitemap'
    | 'legal-notice'
    | 'privacy'
    | 'accessibility'

  /** Chaînes vides quand rien n'est saisi. */
  interface PageMeta {
    title: string
    description: string
  }

  type PageMetas = Partial<Record<PageKey, PageMeta>>

  interface Input {
    title?: string | undefined
    description: string
    /** Titre saisi dans l'admin, servi tel quel (sans le nom du site) ; vide, le titre calculé. */
    metaTitle?: string | undefined
    /** Description saisie dans l'admin ; vide, `description`. */
    metaDescription?: string | undefined
    path: string
    canonicalPath?: string | undefined
    noindex?: boolean | undefined
    image?: Image | undefined
    breadcrumb?: BreadcrumbItem[] | undefined
    jsonLd?: JsonLd[] | undefined
    prevPath?: string | undefined
    nextPath?: string | undefined
    /** Page d'article : `og:type` article et date de publication (AAAA-MM-JJ). */
    publishedTime?: string | undefined
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
    ogType: 'website' | 'article'
    publishedTime: string | undefined
  }
}
