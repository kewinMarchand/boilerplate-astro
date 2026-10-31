import { matomoConfig, pageViewCommands, setupCommands } from './matomo'

describe('mesure d’audience Matomo', () => {
  it('reste éteinte sans URL ou sans identifiant de site', () => {
    expect(matomoConfig(undefined, '1')).toBeNull()
    expect(matomoConfig('http://audience.test/', undefined)).toBeNull()
  })

  it('construit les adresses du script et du traceur', () => {
    expect(matomoConfig('http://audience.test', '3')).toEqual({
      scriptUrl: 'http://audience.test/matomo.js',
      trackerUrl: 'http://audience.test/matomo.php',
      siteId: '3',
    })
  })

  it('désactive les cookies avant toute autre commande', () => {
    const config = matomoConfig('http://audience.test/', '3')
    expect(config && setupCommands(config)[0]).toEqual(['disableCookies'])
  })

  it('envoie une page vue avec l’URL, le titre et la page précédente', () => {
    expect(
      pageViewCommands({
        url: 'http://site.test/contact',
        title: 'Contact',
        referrer: 'http://site.test/',
      }),
    ).toEqual([
      ['setReferrerUrl', 'http://site.test/'],
      ['setCustomUrl', 'http://site.test/contact'],
      ['setDocumentTitle', 'Contact'],
      ['trackPageView'],
    ])
    expect(
      pageViewCommands({ url: 'http://site.test/', title: 'Accueil', referrer: undefined })[0],
    ).toEqual(['setCustomUrl', 'http://site.test/'])
  })
})
