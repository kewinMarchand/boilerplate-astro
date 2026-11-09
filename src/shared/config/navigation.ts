import { format } from '@/shared/i18n'

import { computeComplianceStatus } from './accessibility'
import { SITE } from './site'

import type { Dictionary } from '@/shared/i18n'
import type { AppPath } from '@/shared/routing'

export interface NavigationItem {
  href: AppPath
  /** Libellé dans le dictionnaire de la page (`nav`). */
  labelKey: keyof Dictionary['nav']
}

export interface NavigationNode {
  id: string
  label: string
  path: AppPath
  children: NavigationNode[]
}

export const CATALOG_NAVIGATION: NavigationItem = { href: '/catalogue', labelKey: 'catalog' }

export const BLOG_NAVIGATION: NavigationItem = { href: '/blog', labelKey: 'blog' }

export const MAIN_NAVIGATION: NavigationItem[] = [
  { href: '/', labelKey: 'home' },
  BLOG_NAVIGATION,
  { href: '/taches', labelKey: 'tasks' },
  { href: '/contact', labelKey: 'contact' },
]

export const LEGAL_NAVIGATION: NavigationItem[] = [
  { href: '/mentions-legales', labelKey: 'legalNotice' },
  { href: '/donnees-personnelles', labelKey: 'privacy' },
  { href: '/accessibilite', labelKey: 'accessibility' },
  { href: '/plan-du-site', labelKey: 'sitemap' },
]

export const ALL_NAVIGATION: NavigationItem[] = [
  ...MAIN_NAVIGATION,
  CATALOG_NAVIGATION,
  ...LEGAL_NAVIGATION,
]

/** Libellé d'un lien dans la langue de la page ; celui de l'accessibilité porte l'état de conformité. */
export const navigationLabel = (
  { labelKey }: NavigationItem,
  t: Pick<Dictionary, 'nav' | 'compliance'>,
) => format(t.nav[labelKey], { status: t.compliance[computeComplianceStatus(SITE.accessibility)] })

export const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href)
