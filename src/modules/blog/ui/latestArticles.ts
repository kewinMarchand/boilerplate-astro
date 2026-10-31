import { findLatestArticles } from '../infrastructure/articleRepository'
import { ArticlesLoadError } from '../infrastructure/ArticlesLoadError'

import type { Article } from '../domain/article'

/** Derniers articles pour l'accueil, rendus côté serveur : échec de l'API traduit en état d'erreur. */
export const loadLatestArticles = async (): Promise<Article.Blog> => {
  try {
    return { status: 'success', articles: await findLatestArticles() }
  } catch {
    return { status: 'error', message: new ArticlesLoadError().message }
  }
}
