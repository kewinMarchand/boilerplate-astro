import { z } from 'zod'

import type { AppPath } from '@/shared/routing'

/** Messages d'erreur des champs, dans la langue de la page (`contact.validation` du dictionnaire). */
export interface ValidationMessages {
  name: string
  email: string
  message: string
}

/** Schéma du formulaire, messages dans la langue de la page : serveur (action) et navigateur (îlot). */
export const createContactSchema = (messages: ValidationMessages) =>
  z.object({
    name: z.string().trim().min(2, { error: messages.name }),
    email: z.email({ error: messages.email }),
    message: z.string().trim().min(10, { error: messages.message }),
    /** Slug du produit d'une demande de renseignement, absent pour un message de contact simple. */
    product: z.string().optional(),
  })

/** Formulaire reçu par le serveur : valeurs validées, ou erreurs de champ dans la langue des messages. */
export const parseContactForm = (messages: ValidationMessages, input: Record<string, unknown>) => {
  const parsed = createContactSchema(messages).safeParse(input)
  return parsed.success
    ? { success: true as const, values: parsed.data }
    : { success: false as const, fieldErrors: z.flattenError(parsed.error).fieldErrors }
}

export declare namespace Contact {
  type FormValues = z.infer<ReturnType<typeof createContactSchema>>

  type Field = keyof FormValues

  type FieldErrors = { [K in Field]?: string[] | undefined }

  /** Produit d'une demande de renseignement, nommé et lié à sa fiche. */
  interface Product {
    slug: string
    name: string
    path: AppPath
  }

  /**
   * Résultat d'un envoi : vu par le formulaire, qu'il passe par l'action serveur ou par l'îlot. Sans
   * JavaScript, la page reprend les valeurs saisies depuis le résultat (le corps de la requête est déjà lu).
   */
  type Outcome =
    | { status: 'sent' }
    | { status: 'invalid'; fieldErrors: FieldErrors; values: FormValues }
    | { status: 'error'; values: FormValues }
}
