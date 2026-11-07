import type { Article } from '@/modules/blog/domain/article'
import type { components } from '@/shared/api/client'

type ArticleDto = components['schemas']['Article']
type ArticleDetailDto = components['schemas']['ArticleDetail']

export const toArticle = (dto: ArticleDto): Article.Entity => ({
  id: String(dto.id),
  slug: dto.slug,
  title: dto.title,
  excerpt: dto.excerpt,
  image: dto.image,
  publishedAt: dto.publishedAt,
})

export const toArticleDetail = (dto: ArticleDetailDto): Article.Detail => ({
  ...toArticle(dto),
  html: dto.html,
})
