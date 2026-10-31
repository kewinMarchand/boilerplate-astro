import type { NavigationNode } from '@/shared/config'

declare global {
  namespace App {
    interface Locals {
      /** Arbre des catégories du catalogue, chargé une fois par requête (menu du header, plan du site). */
      categoryMenu: NavigationNode[]
    }
  }
}
