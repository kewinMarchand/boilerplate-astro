import { maintenancePage } from './maintenancePage'

describe('maintenancePage', () => {
  it("sert la page dans la langue de l'adresse, sinon dans la langue par défaut du site", () => {
    const english = maintenancePage('/en/contact', ['fr', 'en'])
    const french = maintenancePage('/fr/contact', ['fr', 'en'])
    const monolingual = maintenancePage('/en/contact', ['fr'])
    const englishByDefault = maintenancePage('/contact', ['en', 'fr'])

    expect(english).toContain('<html lang="en">')
    expect(english).toContain('<h1>Site under maintenance</h1>')
    expect(french).toContain('<h1>Site en maintenance</h1>')
    expect(monolingual).toContain('<html lang="fr">')
    expect(englishByDefault).toContain('<html lang="en">')
  })
})
