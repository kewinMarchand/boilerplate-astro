import { articleHref } from '../domain/article'
import { ArticleLoadError } from '../infrastructure/ArticleLoadError'
import { findArticle, findLatestArticles } from '../infrastructure/articleRepository'

import type { Article } from '../domain/article'
import type { AppPath } from '@/shared/routing'

/** Fiche administrée dans l'API : inconnue de l'API, introuvable ; échec, état d'erreur. */
export const loadArticle = async (slug: string): Promise<Article.Load> => {
  let article: Article.Detail | null
  try {
    article = await findArticle(slug)
  } catch {
    return { status: 'error', message: new ArticleLoadError().message }
  }
  return article ? { status: 'success', article } : { status: 'not-found' }
}

/** Chemins des fiches pour le sitemap ; aucun si l'API ne répond pas. */
export const listArticlePaths = async (): Promise<AppPath[]> =>
  (await findLatestArticles().catch(() => [])).map((article) => articleHref(article.slug))
