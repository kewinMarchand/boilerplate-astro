export declare namespace LegalPage {
  type Slug = 'mentions-legales' | 'donnees-personnelles' | 'accessibilite'

  interface Section {
    title: string
    /** HTML produit par l'API depuis le Markdown de l'admin, HTML saisi échappé. */
    html: string
  }

  interface Entity {
    title: string
    introduction: string
    sections: Section[]
  }

  /** Ce que la page affiche : le texte de l'API, ou le message d'erreur. */
  type Content = { status: 'error'; message: string } | { status: 'success'; page: Entity }

  type Load = { status: 'not-found' } | Content
}
