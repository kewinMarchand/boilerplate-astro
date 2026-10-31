import { MAIN_NAVIGATION } from '@/shared/config'

import type { Seo } from './seo'

const HOME = MAIN_NAVIGATION[0]

export const buildBreadcrumb = (
  current: Seo.BreadcrumbItem,
  parents: Seo.BreadcrumbItem[] = [],
): Seo.BreadcrumbItem[] => [{ label: HOME?.label ?? 'Accueil', path: '/' }, ...parents, current]
