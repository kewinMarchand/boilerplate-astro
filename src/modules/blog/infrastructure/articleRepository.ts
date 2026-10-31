import { ApiError } from '@/shared/api/client'
import { serverApiClient } from '@/shared/api/client.server'

import { toArticle } from './http/articleTranslation'

import type { Article } from '../domain/article'

export const findLatestArticles = async (): Promise<Article.Entity[]> => {
  const { data, response } = await serverApiClient().GET('/api/articles')
  if (!data) throw new ApiError(response)
  return data.map(toArticle)
}
