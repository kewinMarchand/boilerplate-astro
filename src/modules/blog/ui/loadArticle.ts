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

/** Fiches d'une langue pour le sitemap, associées d'une langue à l'autre par `key` ; aucune si l'API ne répond pas. */
export const listArticleEntries = async (
  locale: string,
): Promise<{ key: string; path: AppPath }[]> =>
  (await findLatestArticles(undefined, locale).catch(() => [])).map((article) => ({
    key: article.id,
    path: articleHref(article.slug),
  }))
