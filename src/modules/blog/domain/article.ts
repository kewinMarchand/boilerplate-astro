import type { ImageView } from '@/shared/ui/kit'

export declare namespace Article {
  type Id = string

  interface Entity {
    id: Id
    title: string
    excerpt: string
    image: ImageView | null
    publishedAt: string
  }

  type Blog = { status: 'success'; articles: Entity[] } | { status: 'error'; message: string }

  type Status = 'pending' | 'error' | 'success'
}
