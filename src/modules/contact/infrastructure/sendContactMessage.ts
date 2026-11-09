import { ApiError } from '@/shared/api/client'
import { serverApiClient } from '@/shared/api/client.server'

import { toFieldErrors } from './http/contactTranslation'

import type { Contact } from '../domain/contactSchema'
import type { FieldError } from './http/contactTranslation'

export type ContactSendResult =
  { status: 'sent' } | { status: 'invalid'; fieldErrors: FieldError[] }

export const sendContactMessage = async (
  values: Contact.FormValues,
  locale: string,
): Promise<ContactSendResult> => {
  // Langue de la page en `Accept-Language` : les violations 422 de l'API arrivent dans cette langue
  const { error, response } = await serverApiClient().POST('/api/contact_messages', {
    body: { ...values, product: values.product ?? null },
    headers: { 'Accept-Language': locale },
  })
  if (response.status === 422) return { status: 'invalid', fieldErrors: toFieldErrors(error) }
  if (!response.ok) throw new ApiError(response)
  return { status: 'sent' }
}
