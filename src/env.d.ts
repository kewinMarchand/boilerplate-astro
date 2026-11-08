import type { NavigationNode, SiteIdentity } from '@/shared/config'
import type { Seo } from '@/shared/seo'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

declare global {
  namespace App {
    interface Locals {
      /** Identité du site lue dans l'API (repli sur la configuration), chargée une fois par requête. */
      siteIdentity: SiteIdentity
      /** Titres et descriptions des pages fixes saisis dans l'API (vide si l'API échoue). */
      pageMetas: Seo.PageMetas
      /** Arbre des catégories du catalogue, chargé une fois par requête (menu du header, plan du site). */
      categoryMenu: NavigationNode[]
      /** Lien du panier du header, posé par le middleware : le socle n'importe pas de module. */
      cartLink: AstroComponentFactory
    }
  }
}
