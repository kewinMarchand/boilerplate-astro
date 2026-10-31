import { defineAction } from 'astro:actions'

import { contactSchema } from '@/modules/contact'
import { submitContactMessage } from '@/modules/contact/index.server'

export const server = {
  contact: defineAction({
    accept: 'form',
    input: contactSchema,
    handler: (values) => submitContactMessage(values),
  }),
}
