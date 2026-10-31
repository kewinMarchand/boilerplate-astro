import { toFieldErrors } from './contactTranslation'

describe('toFieldErrors', () => {
  it('garde les violations des champs du formulaire, avec le message de l’API', () => {
    expect(
      toFieldErrors({
        status: 422,
        violations: [
          { propertyPath: 'email', message: 'Indiquez une adresse e-mail valide.' },
          { propertyPath: 'inconnu', message: 'Ignoré.' },
        ],
      }),
    ).toEqual([{ field: 'email', message: 'Indiquez une adresse e-mail valide.' }])
  })

  it('ne renvoie rien sans violations', () => {
    expect(toFieldErrors(undefined)).toEqual([])
  })
})
