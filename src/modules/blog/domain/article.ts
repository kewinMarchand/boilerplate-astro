import type { AppPath } from '@/shared/routing'
import type { ImageView } from '@/shared/ui/kit'

export declare namespace Article {
  type Id = string

  /** Rubrique ou format, administrés dans l'API. */
  interface Term {
    slug: string
    name: string
  }

  interface Audio {
    src: string
    type: string
    durationSeconds: number
  }

  interface Entity {
    id: Id
    slug: string
    title: string
    excerpt: string
    image: ImageView | null
    publishedAt: string
    section: Term | null
    format: Term | null
    audio: Audio | null
    /** Intervenant de l'audio, vide si aucun. */
    speaker: string
  }

  type Blog = { status: 'success'; articles: Entity[] } | { status: 'error'; message: string }

  type Status = 'pending' | 'error' | 'success'

  /** Fiche : l'article et son texte en HTML, converti par l'API depuis le Markdown saisi dans l'admin. */
  interface Detail extends Entity {
    html: string
    /** Saisis dans l'admin, chaînes vides sinon : la fiche garde alors son titre et son extrait. */
    metaTitle: string
    metaDescription: string
    /** La fiche dans chaque langue où l'article existe ; vide sur un site monolingue. */
    alternates: Alternate[]
  }

  /** Chemin d'un élément dans une langue, sans préfixe de langue (sélecteur, hreflang, sitemap). */
  interface Alternate {
    locale: string
    path: AppPath
  }

  type Load =
    | { status: 'success'; article: Detail }
    | { status: 'not-found' }
    | { status: 'error'; message: string }

  /** Ce qu'affiche la fiche : l'article, ou le message d'erreur de l'API. */
  type Page = Exclude<Load, { status: 'not-found' }>
}

export const articleHref = (slug: string): AppPath => `/blog/${slug}`

export const SECTION_PARAM = 'rubrique'

export const sectionHref = (slug: string): AppPath =>
  `/blog?${SECTION_PARAM}=${encodeURIComponent(slug)}`
