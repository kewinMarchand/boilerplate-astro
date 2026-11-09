import type { Seo } from './seo'

/** Fil d'Ariane : l'accueil (`homeLabel`, dans la langue de la page), les parents, puis la page. */
export const buildBreadcrumb = (
  current: Seo.BreadcrumbItem,
  parents: Seo.BreadcrumbItem[],
  homeLabel: string,
): Seo.BreadcrumbItem[] => [{ label: homeLabel, path: '/' }, ...parents, current]
