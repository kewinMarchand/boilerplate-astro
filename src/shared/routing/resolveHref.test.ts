import { resolveHref, toAppPath } from './resolveHref'

describe('toAppPath', () => {
  it('retire la barre finale des pages pré-rendues, sauf à la racine', () => {
    expect(toAppPath('/mentions-legales/')).toBe('/mentions-legales')
    expect(toAppPath('/catalogue/plantes-interieur')).toBe('/catalogue/plantes-interieur')
    expect(toAppPath('/')).toBe('/')
  })
})

describe('resolveHref dans le navigateur', () => {
  afterEach(() => {
    document.documentElement.lang = ''
    history.replaceState(null, '', '/')
  })

  it('garde le chemin sur une page sans préfixe de langue', () => {
    document.documentElement.lang = 'fr'
    history.replaceState(null, '', '/catalogue')

    expect(resolveHref('/contact')).toBe('/contact')
  })

  it('préfixe les liens d’une page servie sous le préfixe de sa langue', () => {
    document.documentElement.lang = 'en'
    history.replaceState(null, '', '/en/catalogue')

    expect(resolveHref('/contact')).toBe('/en/contact')
    expect(resolveHref('/')).toBe('/en')
  })
})
