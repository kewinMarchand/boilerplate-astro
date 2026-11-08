import { findArticleSections } from '../infrastructure/articleRepository'

import type { Article } from '../domain/article'

/** Rubriques du filtre de /blog ; API en erreur, aucune : le filtre disparaît, la liste reste servie. */
export const loadArticleSections = async (): Promise<Article.Term[]> =>
  findArticleSections().catch(() => [])
