import { defineAction } from 'astro:actions'

import { requestedLocale } from '@/shared/i18n'
import { dictionaryFor } from '@/shared/i18n/index.server'

import { submitContactMessage } from '@/modules/contact/index.server'

export const server = {
  // Langue du formulaire : son champ caché (îlot, qui appelle /_actions/contact sans préfixe de langue), sinon
  // celle de la page (envoi sans JavaScript, servi sous le préfixe). Validation et envoi dans cette langue.
  contact: defineAction({
    accept: 'form',
    handler: (form, { locals }) => {
      const locale = requestedLocale(form.get('locale'), locals.locale)
      const { validation } = dictionaryFor({ ...locals.locale, locale }).contact
      return submitContactMessage(form, locale, validation)
    },
  }),
}
