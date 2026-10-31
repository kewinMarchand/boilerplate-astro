import { toAppPath } from './resolveHref'

describe('toAppPath', () => {
  it('retire la barre finale des pages pré-rendues, sauf à la racine', () => {
    expect(toAppPath('/mentions-legales/')).toBe('/mentions-legales')
    expect(toAppPath('/catalogue/plantes-interieur')).toBe('/catalogue/plantes-interieur')
    expect(toAppPath('/')).toBe('/')
  })
})
