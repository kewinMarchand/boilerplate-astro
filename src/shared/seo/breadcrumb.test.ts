import { buildBreadcrumb } from './breadcrumb'
import { buildBreadcrumbJsonLd } from './buildPageMeta'

const FR = { locale: 'fr', defaultLocale: 'fr', locales: ['fr', 'en'] }

describe('buildBreadcrumb', () => {
  it('part de l’accueil et finit par la page courante', () => {
    expect(buildBreadcrumb({ label: 'Contact', path: '/contact' }, [], 'Accueil')).toEqual([
      { label: 'Accueil', path: '/' },
      { label: 'Contact', path: '/contact' },
    ])
  })

  it('insère les parents dans l’ordre', () => {
    const trail = buildBreadcrumb(
      { label: 'Feuillages', path: '/catalogue/a/feuillages' },
      [
        { label: 'Catalogue', path: '/catalogue' },
        { label: 'Plantes d’intérieur', path: '/catalogue/a' },
      ],
      'Accueil',
    )

    expect(trail.map((item) => item.label)).toEqual([
      'Accueil',
      'Catalogue',
      'Plantes d’intérieur',
      'Feuillages',
    ])
  })

  it('produit un BreadcrumbList aux positions cohérentes et URL absolues', () => {
    const jsonLd = buildBreadcrumbJsonLd(
      buildBreadcrumb({ label: 'Contact', path: '/contact' }, [], 'Accueil'),
      FR,
    )

    expect(jsonLd['@type']).toBe('BreadcrumbList')
    expect(jsonLd.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'http://localhost:4321/' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'http://localhost:4321/contact' },
    ])
  })

  it('donne les adresses dans la langue de la page', () => {
    const jsonLd = buildBreadcrumbJsonLd(
      buildBreadcrumb({ label: 'Contact', path: '/contact' }, [], 'Home'),
      { ...FR, locale: 'en' },
    )

    expect(jsonLd.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'http://localhost:4321/en' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact',
        item: 'http://localhost:4321/en/contact',
      },
    ])
  })
})
