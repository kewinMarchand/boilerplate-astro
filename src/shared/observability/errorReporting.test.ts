import { errorReportingConfig, glitchtipOptions, shouldReportError } from './errorReporting'

describe('suivi des erreurs', () => {
  it('reste éteint sans DSN', () => {
    expect(errorReportingConfig(undefined, undefined, false)).toBeNull()
    expect(errorReportingConfig('', 'production', false)).toBeNull()
  })

  it('prend l’environnement du framework par défaut', () => {
    expect(errorReportingConfig('http://cle@erreurs.test/1', undefined, true)).toEqual({
      dsn: 'http://cle@erreurs.test/1',
      environment: 'development',
    })
    expect(errorReportingConfig('http://cle@erreurs.test/1', 'recette', false)?.environment).toBe(
      'recette',
    )
  })

  it('ne remonte que les erreurs inattendues hors scénario de test', () => {
    expect(shouldReportError({ kind: 'unknown', scenario: null })).toBe(true)
    expect(shouldReportError({ kind: 'framework', scenario: null })).toBe(false)
    expect(shouldReportError({ kind: 'app', scenario: null })).toBe(false)
    expect(shouldReportError({ kind: 'unknown', scenario: 'error' })).toBe(false)
  })

  it('n’envoie ni donnée personnelle ni trace de performance', () => {
    expect(
      glitchtipOptions({ dsn: 'http://cle@erreurs.test/1', environment: 'production' }),
    ).toEqual({
      dsn: 'http://cle@erreurs.test/1',
      environment: 'production',
      sendDefaultPii: false,
      tracesSampleRate: 0,
    })
  })
})
