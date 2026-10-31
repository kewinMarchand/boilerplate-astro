<script lang="ts">
  import { Checkbox, Select, Switch, TextField } from '@/shared/ui/kit'

  import Section from './Section.svelte'

  const uid = $props.id()

  let text = $state('')
  let email = $state('ada')
  let message = $state('')
  let disabledValue = $state('Valeur figée')
</script>

<Section id="formulaires" title="Formulaires">
  <form class="grid max-w-form gap-4" onsubmit={(event) => event.preventDefault()}>
    <TextField
      name="sg-text"
      label="Champ texte"
      hint="Aide : 2 caractères minimum."
      bind:value={text}
    />
    <TextField
      name="sg-email"
      label="E-mail"
      type="email"
      required
      errors={['Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.']}
      bind:value={email}
    />
    <div class="bui-field">
      <label class="bui-field__label" for="{uid}-number">Nombre</label>
      <input
        class="bui-field__input"
        type="number"
        id="{uid}-number"
        inputmode="numeric"
        min="0"
        value="12"
      />
    </div>
    <TextField name="sg-message" label="Zone de texte" multiline bind:value={message} />
    <Select
      id="{uid}-select"
      label="Liste déroulante"
      options={[
        { value: 'a', label: 'Première option' },
        { value: 'b', label: 'Seconde option' },
      ]}
    />
    <Checkbox id="{uid}-checkbox" label="Case à cocher" checked />
    <Switch id="{uid}-switch" label="Interrupteur" />
    <fieldset class="bui-fieldset">
      <legend class="bui-fieldset__legend">Boutons radio</legend>
      <div class="bui-fieldset__content">
        {#each ['A', 'B'] as option (option)}
          <div class="bui-radio">
            <input
              class="bui-radio__input"
              id="{uid}-radio-{option}"
              type="radio"
              name="sg-radio"
              value={option}
              checked={option === 'A'}
            />
            <label class="bui-radio__label" for="{uid}-radio-{option}">Option {option}</label>
          </div>
        {/each}
      </div>
    </fieldset>
    <TextField name="sg-disabled" label="Champ désactivé" disabled bind:value={disabledValue} />
  </form>
</Section>
