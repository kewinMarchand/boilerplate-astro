export declare namespace Article {
  type Id = string

  interface Entity {
    id: Id
    title: string
    excerpt: string
    imageBasePath: string
    publishedAt: string
  }

  type Blog = { status: 'success'; articles: Entity[] } | { status: 'error'; message: string }

  type Status = 'pending' | 'error' | 'success'
}
