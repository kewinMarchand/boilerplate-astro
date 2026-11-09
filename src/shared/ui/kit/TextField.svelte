<!-- Champ de formulaire superforms : identifiant dérivé du nom, premier message de `errors`, zone de texte si `multiline`. -->
<script lang="ts">
  import { TextArea, TextField } from '@kewinmarchand/boilerplates-ui/svelte'

  interface Props {
    name: string
    label: string
    value: string
    errors?: string[] | undefined
    hint?: string | undefined
    disabled?: boolean
    multiline?: boolean
    type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'search'
    autocomplete?: HTMLInputElement['autocomplete'] | undefined
    required?: boolean
    /** Mention des champs obligatoires, dans la langue de la page. */
    requiredLabel?: string | undefined
    'data-testid'?: string | undefined
  }

  let {
    name,
    label,
    value = $bindable(),
    errors,
    hint,
    disabled = false,
    multiline = false,
    type = 'text',
    autocomplete,
    required = false,
    requiredLabel,
    'data-testid': testId,
  }: Props = $props()

  const uid = $props.id()
  const id = $derived(`${uid}-${name}`)
</script>

{#if multiline}
  <TextArea
    {id}
    {name}
    {label}
    {hint}
    error={errors?.[0]}
    {required}
    {requiredLabel}
    {disabled}
    data-testid={testId}
    bind:value
  />
{:else}
  <TextField
    {id}
    {name}
    {label}
    {hint}
    error={errors?.[0]}
    {required}
    {requiredLabel}
    {disabled}
    {type}
    {autocomplete}
    data-testid={testId}
    bind:value
  />
{/if}
