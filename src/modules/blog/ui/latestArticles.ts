import { findLatestArticles } from '../infrastructure/articleRepository'
import { ArticlesLoadError } from '../infrastructure/ArticlesLoadError'

import type { Article } from '../domain/article'

/** Derniers articles, d'une rubrique ou de toutes, rendus côté serveur : échec de l'API traduit en état d'erreur. */
export const loadLatestArticles = async (section?: string): Promise<Article.Blog> => {
  try {
    return { status: 'success', articles: await findLatestArticles(section) }
  } catch {
    return { status: 'error', message: new ArticlesLoadError().message }
  }
}
