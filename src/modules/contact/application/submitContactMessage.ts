import { sendContactMessage } from '../infrastructure/sendContactMessage'

import type { Contact } from '../domain/contactSchema'

/**
 * Cas d'utilisation « envoyer un message » : les violations 422 de l'API deviennent des erreurs de
 * champ, un échec de l'API un résultat en erreur, sans message technique.
 */
export const submitContactMessage = async (
  values: Contact.FormValues,
): Promise<Contact.Outcome> => {
  try {
    const result = await sendContactMessage(values)
    if (result.status === 'sent') return { status: 'sent' }

    const fieldErrors: Contact.FieldErrors = {}
    for (const { field, message } of result.fieldErrors) {
      fieldErrors[field] = [...(fieldErrors[field] ?? []), message]
    }
    return { status: 'invalid', fieldErrors }
  } catch {
    return { status: 'error' }
  }
}
