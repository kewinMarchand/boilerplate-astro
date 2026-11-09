import { articleHref } from '@/modules/blog/domain/article'

import type { Article } from '@/modules/blog/domain/article'
import type { components } from '@/shared/api/client'

type ArticleDto = components['schemas']['Article']
type ArticleDetailDto = components['schemas']['ArticleDetail']
type ArticleTermDto = components['schemas']['ArticleTerm']

export const toTerm = (dto: ArticleTermDto): Article.Term => ({ slug: dto.slug, name: dto.name })

export const toArticle = (dto: ArticleDto): Article.Entity => ({
  id: String(dto.id),
  slug: dto.slug,
  title: dto.title,
  excerpt: dto.excerpt,
  image: dto.image,
  publishedAt: dto.publishedAt,
  section: dto.section && toTerm(dto.section),
  format: dto.format && toTerm(dto.format),
  audio: dto.audio && {
    src: dto.audio.src,
    type: dto.audio.type,
    durationSeconds: dto.audio.durationSeconds,
  },
  speaker: dto.speaker.trim(),
})

export const toArticleDetail = (dto: ArticleDetailDto): Article.Detail => ({
  ...toArticle(dto),
  html: dto.html,
  metaTitle: dto.metaTitle.trim(),
  metaDescription: dto.metaDescription.trim(),
  alternates: dto.alternates.map(({ locale, slug }) => ({ locale, path: articleHref(slug) })),
})
