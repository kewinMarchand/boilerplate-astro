import { z } from 'zod'

import type { AppPath } from '@/shared/routing'

export const contactSchema = z.object({
  name: z.string().trim().min(2, { error: 'Indiquez votre nom (2 caractères minimum).' }),
  email: z.email({ error: 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.' }),
  message: z
    .string()
    .trim()
    .min(10, { error: 'Votre message doit contenir au moins 10 caractères.' }),
  /** Slug du produit d'une demande de renseignement, absent pour un message de contact simple. */
  product: z.string().optional(),
})

export declare namespace Contact {
  type FormValues = z.infer<typeof contactSchema>

  type Field = keyof FormValues

  type FieldErrors = { [K in Field]?: string[] | undefined }

  /** Produit d'une demande de renseignement, nommé et lié à sa fiche. */
  interface Product {
    slug: string
    name: string
    path: AppPath
  }

  /** Résultat d'un envoi : vu par le formulaire, qu'il passe par l'action serveur ou par l'îlot. */
  type Outcome =
    { status: 'sent' } | { status: 'invalid'; fieldErrors: FieldErrors } | { status: 'error' }
}
