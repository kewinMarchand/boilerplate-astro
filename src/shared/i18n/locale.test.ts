import { en } from './dictionaries/en'
import { fr } from './dictionaries/fr'
import { format, plural } from './format'
import { dictionaryFor } from './index.server'
import {
  alternatesByKey,
  languageName,
  localeContext,
  localePrefix,
  localizePath,
  ogLocale,
  pathLocale,
  requestedLocale,
  unlocalizePath,
} from './locale'

const keysOf = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keysOf(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )

const BILINGUAL = { locale: 'en', defaultLocale: 'fr', locales: ['fr', 'en'] }

describe('dictionnaires', () => {
  it('ont les mêmes clés en français et en anglais', () => {
    expect(keysOf(en).sort()).toEqual(keysOf(fr).sort())
  })

  it('ne contiennent que des données sérialisables', () => {
    expect(JSON.parse(JSON.stringify(en))).toEqual(en)
    expect(JSON.parse(JSON.stringify(fr))).toEqual(fr)
  })

  it('donnent ceux de la langue par défaut à une langue sans fichier de traduction', () => {
    expect(dictionaryFor(BILINGUAL)).toBe(en)
    expect(dictionaryFor({ locale: 'de', defaultLocale: 'en', locales: ['en', 'de'] })).toBe(en)
    expect(dictionaryFor({ locale: 'de', defaultLocale: 'it', locales: ['it', 'de'] })).toBe(fr)
  })
})

describe('format et plural', () => {
  it('remplacent les valeurs nommées et choisissent la forme selon la langue', () => {
    expect(format('Retirer {name}', { name: 'Monstera' })).toBe('Retirer Monstera')
    expect(format('{inconnue}')).toBe('{inconnue}')
    expect(plural(fr.catalog.productCount, 0, 'fr-FR')).toBe('0 produit')
    expect(plural(fr.catalog.productCount, 2, 'fr-FR')).toBe('2 produits')
    expect(plural(en.catalog.productCount, 0, 'en-US')).toBe('0 products')
    expect(plural(en.catalog.productCount, 1, 'en-US')).toBe('1 product')
  })
})

describe('localizePath', () => {
  it('ne préfixe pas la langue par défaut, préfixe les autres', () => {
    expect(localizePath('/catalogue', 'fr', 'fr')).toBe('/catalogue')
    expect(localizePath('/catalogue', 'en', undefined)).toBe('/en/catalogue')
    expect(localizePath('/catalogue?page=2', 'en', 'fr')).toBe('/en/catalogue?page=2')
    expect(localizePath('/', 'en', 'fr')).toBe('/en')
    expect(localizePath('/?a=1', 'en', 'fr')).toBe('/en?a=1')
  })

  it('laisse les ancres et les adresses externes', () => {
    expect(localizePath('#main', 'en', 'fr')).toBe('#main')
    expect(localizePath('https://exemple.fr/', 'en', 'fr')).toBe('https://exemple.fr/')
    expect(localizePath('//exemple.fr/', 'en', 'fr')).toBe('//exemple.fr/')
  })
})

describe('langue d’une adresse', () => {
  it('lit le préfixe qui a la forme d’une langue', () => {
    expect(localePrefix('/en/catalogue')).toBe('en')
    expect(localePrefix('/en')).toBe('en')
    expect(localePrefix('/catalogue')).toBeUndefined()
    expect(localePrefix('/')).toBeUndefined()
  })

  it('ne reconnaît que les langues activées autres que la langue par défaut', () => {
    expect(pathLocale('/en/catalogue', ['fr', 'en'])).toBe('en')
    expect(pathLocale('/fr/catalogue', ['fr', 'en'])).toBe('fr')
    expect(pathLocale('/de/catalogue', ['fr', 'en'])).toBe('fr')
    expect(pathLocale('/en/catalogue', ['fr'])).toBe('fr')
    expect(localeContext('/catalogue', ['en', 'fr'])).toEqual({
      locale: 'en',
      defaultLocale: 'en',
      locales: ['en', 'fr'],
    })
  })

  it('retire le préfixe de la langue de la page, et lui seul', () => {
    expect(unlocalizePath('/en/catalogue', BILINGUAL)).toBe('/catalogue')
    expect(unlocalizePath('/en', BILINGUAL)).toBe('/')
    expect(unlocalizePath('/de/catalogue', BILINGUAL)).toBe('/de/catalogue')
    expect(unlocalizePath('/en/x', { ...BILINGUAL, locale: 'fr' })).toBe('/en/x')
  })
})

describe('alternatesByKey', () => {
  it('associe un élément d’une langue à l’autre par sa clé, dans l’ordre de la langue par défaut', () => {
    expect(
      alternatesByKey([
        {
          locale: 'fr',
          entries: [
            { key: '1', path: '/produit/monstera' },
            { key: '2', path: '/produit/fougere' },
          ],
        },
        { locale: 'en', entries: [{ key: '1', path: '/produit/swiss-cheese-plant' }] },
      ]),
    ).toEqual([
      [
        { locale: 'fr', path: '/produit/monstera' },
        { locale: 'en', path: '/produit/swiss-cheese-plant' },
      ],
      [{ locale: 'fr', path: '/produit/fougere' }],
    ])
  })
})

describe('noms et codes des langues', () => {
  it('nomme chaque langue dans cette langue et donne son code Open Graph', () => {
    expect(languageName('fr')).toBe('Français')
    expect(languageName('en')).toBe('English')
    expect(ogLocale('fr')).toBe('fr_FR')
    expect(ogLocale('en')).toBe('en_US')
    expect(ogLocale('de')).toBe('de')
  })
})

describe('requestedLocale', () => {
  it('garde la langue demandée par le formulaire si le site l’a activée, sinon celle de la page', () => {
    expect(requestedLocale('en', BILINGUAL)).toBe('en')
    expect(requestedLocale('de', BILINGUAL)).toBe('en')
    expect(requestedLocale(null, { ...BILINGUAL, locale: 'fr' })).toBe('fr')
  })
})
