<script lang="ts">
  import { actions } from 'astro:actions'

  import { Alert, Button, TextField } from '@/shared/ui/kit'

  import { createContactSchema } from '../domain/contactSchema'

  import type { Contact, ValidationMessages } from '../domain/contactSchema'

  interface Props {
    /** Action du formulaire HTML (envoi sans JavaScript). */
    formAction: string
    /** Slug du produit d'une demande de renseignement, envoyé dans un champ caché. */
    product?: string | undefined
    values: Contact.FormValues
    errors: Contact.FieldErrors
    status?: 'sent' | 'error' | undefined
    /** Libellés dans la langue de la page (`contact` du dictionnaire). */
    labels: {
      name: string
      email: string
      message: string
      send: string
      sent: string
      inquirySent: string
      sendError: string
      validation: ValidationMessages
      /** Mentions de boilerplates-ui (`ui` du dictionnaire) : champ obligatoire, envoi en cours, préfixes des alertes. */
      required: string
      loading: string
      alert: { success: string; error: string }
    }
    /** Langue de la page, envoyée avec le formulaire sur un site multilingue (l'action n'a pas de préfixe). */
    locale?: string | undefined
  }

  const props: Props = $props()
  // svelte-ignore state_referenced_locally
  const contactSchema = createContactSchema(props.labels.validation)

  // svelte-ignore state_referenced_locally
  let values = $state<Contact.FormValues>({ ...props.values })
  // svelte-ignore state_referenced_locally
  let errors = $state<Contact.FieldErrors>({ ...props.errors })
  // svelte-ignore state_referenced_locally
  let status = $state(props.status)
  let submitting = $state(false)

  const FIELDS: Contact.Field[] = ['name', 'email', 'message']
  const isField = (name: string): name is Contact.Field => FIELDS.some((field) => field === name)

  const toFieldErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
    const result: Contact.FieldErrors = {}
    for (const { path, message } of issues) {
      const field = String(path[0])
      if (isField(field)) result[field] = [...(result[field] ?? []), message]
    }
    return result
  }

  // Validation au blur, pas à chaque frappe.
  const handleFocusOut = (event: FocusEvent) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
    if (!isField(target.name)) return
    const parsed = contactSchema.shape[target.name].safeParse(values[target.name])
    errors = {
      ...errors,
      [target.name]: parsed.success
        ? undefined
        : toFieldErrors(parsed.error.issues.map((issue) => ({ ...issue, path: [target.name] })))[
            target.name
          ],
    }
  }

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    status = undefined
    const parsed = contactSchema.safeParse(values)
    if (!parsed.success) {
      errors = toFieldErrors(parsed.error.issues)
      return
    }
    if (!(event.currentTarget instanceof HTMLFormElement)) return

    submitting = true
    const { data, error } = await actions.contact(new FormData(event.currentTarget))
    submitting = false

    if (error) {
      status = 'error'
      return
    }
    if (data.status === 'invalid') {
      errors = data.fieldErrors
    } else if (data.status === 'sent') {
      values = { name: '', email: '', message: '' }
      errors = {}
      status = 'sent'
    } else {
      status = 'error'
    }
  }
</script>

<form
  method="POST"
  action={props.formAction}
  novalidate
  class="flex max-w-form flex-col gap-4"
  onsubmit={handleSubmit}
  onfocusout={handleFocusOut}
>
  <TextField
    name="name"
    label={props.labels.name}
    autocomplete="name"
    required
    requiredLabel={props.labels.required}
    errors={errors.name}
    data-testid="contact-name"
    bind:value={values.name}
  />
  <TextField
    name="email"
    label={props.labels.email}
    type="email"
    autocomplete="email"
    required
    requiredLabel={props.labels.required}
    errors={errors.email}
    data-testid="contact-email"
    bind:value={values.email}
  />
  <TextField
    name="message"
    label={props.labels.message}
    multiline
    required
    requiredLabel={props.labels.required}
    errors={errors.message}
    data-testid="contact-message"
    bind:value={values.message}
  />
  {#if props.product}
    <input type="hidden" name="product" value={props.product} />
  {/if}
  {#if props.locale}
    <input type="hidden" name="locale" value={props.locale} />
  {/if}
  <Button
    type="submit"
    icon="mail"
    loading={submitting}
    loadingLabel={props.labels.loading}
    data-testid="contact-submit"
  >
    {props.labels.send}
  </Button>
  <div aria-live="polite">
    {#if status === 'sent'}
      <Alert variant="success" prefix={props.labels.alert.success} data-testid="contact-success">
        {props.product ? props.labels.inquirySent : props.labels.sent}
      </Alert>
    {:else if errors.product}
      <Alert variant="error" prefix={props.labels.alert.error} data-testid="contact-error"
        >{errors.product.join(' ')}</Alert
      >
    {:else if status === 'error'}
      <Alert variant="error" prefix={props.labels.alert.error} data-testid="contact-error">
        {props.labels.sendError}
      </Alert>
    {/if}
  </div>
</form>
