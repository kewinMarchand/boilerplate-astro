import type { NavigationNode } from '@/shared/config'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

declare global {
  namespace App {
    interface Locals {
      /** Arbre des catégories du catalogue, chargé une fois par requête (menu du header, plan du site). */
      categoryMenu: NavigationNode[]
      /** Lien du panier du header, posé par le middleware : le socle n'importe pas de module. */
      cartLink: AstroComponentFactory
    }
  }
}
