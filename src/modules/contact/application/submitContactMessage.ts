import { parseContactForm } from '../domain/contactSchema'
import { sendContactMessage } from '../infrastructure/sendContactMessage'

import type { Contact, ValidationMessages } from '../domain/contactSchema'

const formValue = (form: FormData, field: Contact.Field) => {
  const value = form.get(field)
  return typeof value === 'string' ? value : undefined
}

/**
 * Cas d'utilisation « envoyer un message » : le formulaire est validé dans la langue de la page, puis envoyé
 * avec cette langue ; les violations 422 de l'API deviennent des erreurs de champ, un échec de l'API un
 * résultat en erreur, sans message technique.
 */
export const submitContactMessage = async (
  form: FormData,
  locale: string,
  messages: ValidationMessages,
): Promise<Contact.Outcome> => {
  const values: Contact.FormValues = {
    name: formValue(form, 'name') ?? '',
    email: formValue(form, 'email') ?? '',
    message: formValue(form, 'message') ?? '',
    product: formValue(form, 'product') || undefined,
  }
  const parsed = parseContactForm(messages, values)
  if (!parsed.success) return { status: 'invalid', fieldErrors: parsed.fieldErrors, values }

  try {
    const result = await sendContactMessage(parsed.values, locale)
    if (result.status === 'sent') return { status: 'sent' }

    const fieldErrors: Contact.FieldErrors = {}
    for (const { field, message } of result.fieldErrors) {
      fieldErrors[field] = [...(fieldErrors[field] ?? []), message]
    }
    return { status: 'invalid', fieldErrors, values }
  } catch {
    return { status: 'error', values }
  }
}
