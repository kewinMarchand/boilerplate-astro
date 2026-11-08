import { computeComplianceStatus } from './accessibility'
import { SITE } from './site'

import type { AppPath } from '@/shared/routing'

export interface NavigationItem {
  href: AppPath
  label: string
}

export interface NavigationNode {
  id: string
  label: string
  path: AppPath
  children: NavigationNode[]
}

export const CATALOG_NAVIGATION: NavigationItem = { href: '/catalogue', label: 'Catalogue' }

export const BLOG_NAVIGATION: NavigationItem = { href: '/blog', label: 'Blog' }

export const MAIN_NAVIGATION: NavigationItem[] = [
  { href: '/', label: 'Accueil' },
  BLOG_NAVIGATION,
  { href: '/taches', label: 'Tâches' },
  { href: '/contact', label: 'Contact' },
]

export const LEGAL_NAVIGATION: NavigationItem[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/donnees-personnelles', label: 'Données personnelles' },
  {
    href: '/accessibilite',
    label: `Accessibilité : ${computeComplianceStatus(SITE.accessibility)}`,
  },
  { href: '/plan-du-site', label: 'Plan du site' },
]

export const ALL_NAVIGATION: NavigationItem[] = [
  ...MAIN_NAVIGATION,
  CATALOG_NAVIGATION,
  ...LEGAL_NAVIGATION,
]

export const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href)
