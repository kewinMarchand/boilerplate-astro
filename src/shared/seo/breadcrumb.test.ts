import { buildBreadcrumb } from './breadcrumb'
import { buildBreadcrumbJsonLd } from './buildPageMeta'

describe('buildBreadcrumb', () => {
  it('part de l’accueil et finit par la page courante', () => {
    expect(buildBreadcrumb({ label: 'Contact', path: '/contact' })).toEqual([
      { label: 'Accueil', path: '/' },
      { label: 'Contact', path: '/contact' },
    ])
  })

  it('insère les parents dans l’ordre', () => {
    const trail = buildBreadcrumb({ label: 'Feuillages', path: '/catalogue/a/feuillages' }, [
      { label: 'Catalogue', path: '/catalogue' },
      { label: 'Plantes d’intérieur', path: '/catalogue/a' },
    ])

    expect(trail.map((item) => item.label)).toEqual([
      'Accueil',
      'Catalogue',
      'Plantes d’intérieur',
      'Feuillages',
    ])
  })

  it('produit un BreadcrumbList aux positions cohérentes et URL absolues', () => {
    const jsonLd = buildBreadcrumbJsonLd(buildBreadcrumb({ label: 'Contact', path: '/contact' }))

    expect(jsonLd['@type']).toBe('BreadcrumbList')
    expect(jsonLd.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'http://localhost:4321/' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'http://localhost:4321/contact' },
    ])
  })
})
