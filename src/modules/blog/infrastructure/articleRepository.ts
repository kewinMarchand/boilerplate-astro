import { ApiError } from '@/shared/api/client'
import { serverApiClient } from '@/shared/api/client.server'

import { toArticle, toArticleDetail, toTerm } from './http/articleTranslation'

import type { Article } from '../domain/article'

/** `section` : slug de rubrique ; inconnu de l'API, liste vide. */
export const findLatestArticles = async (section?: string): Promise<Article.Entity[]> => {
  const { data, response } = await serverApiClient().GET('/api/articles', {
    params: { query: section ? { section } : {} },
  })
  if (!data) throw new ApiError(response)
  return data.map(toArticle)
}

export const findArticleSections = async (): Promise<Article.Term[]> => {
  const { data, response } = await serverApiClient().GET('/api/article-sections')
  if (!data) throw new ApiError(response)
  return data.map(toTerm)
}

/** `null` si l'API ne connaît pas l'article (404). */
export const findArticle = async (slug: string): Promise<Article.Detail | null> => {
  const { data, response } = await serverApiClient().GET('/api/articles/{slug}', {
    params: { path: { slug } },
  })
  if (response.status === 404) return null
  if (!data) throw new ApiError(response)
  return toArticleDetail(data)
}
