import { contactSchema } from './contactSchema'

describe('contactSchema', () => {
  it('accepte un message complet', () => {
    const result = contactSchema.safeParse({
      name: 'Ada',
      email: 'ada@exemple.fr',
      message: 'Bonjour, ceci est un message.',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un e-mail invalide avec un message explicite', () => {
    const result = contactSchema.safeParse({ name: 'Ada', email: 'ada', message: 'Bonjour à tous' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('adresse e-mail valide')
  })
})
