import { createContactSchema } from './contactSchema'

const MESSAGES = { name: 'Nom trop court.', email: 'Adresse invalide.', message: 'Trop court.' }

describe('createContactSchema', () => {
  it('accepte un message complet', () => {
    const result = createContactSchema(MESSAGES).safeParse({
      name: 'Ada',
      email: 'ada@exemple.fr',
      message: 'Bonjour, ceci est un message.',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un e-mail invalide avec le message reçu, celui de la langue de la page', () => {
    const result = createContactSchema(MESSAGES).safeParse({
      name: 'Ada',
      email: 'ada',
      message: 'Bonjour à tous',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(MESSAGES.email)
  })
})
