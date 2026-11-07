import type { AppPath } from '@/shared/routing'
import type { ImageView } from '@/shared/ui/kit'

export declare namespace Article {
  type Id = string

  interface Entity {
    id: Id
    slug: string
    title: string
    excerpt: string
    image: ImageView | null
    publishedAt: string
  }

  type Blog = { status: 'success'; articles: Entity[] } | { status: 'error'; message: string }

  type Status = 'pending' | 'error' | 'success'

  /** Fiche : l'article et son texte en HTML, converti par l'API depuis le Markdown saisi dans l'admin. */
  interface Detail extends Entity {
    html: string
  }

  type Load =
    | { status: 'success'; article: Detail }
    | { status: 'not-found' }
    | { status: 'error'; message: string }

  /** Ce qu'affiche la fiche : l'article, ou le message d'erreur de l'API. */
  type Page = Exclude<Load, { status: 'not-found' }>
}

export const articleHref = (slug: string): AppPath => `/blog/${slug}`
