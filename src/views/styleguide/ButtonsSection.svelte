<script lang="ts">
  import { Button, IconButton } from '@/shared/ui/kit'

  import Section from './Section.svelte'

  const VARIANTS = ['primary', 'secondary', 'outline', 'ghost'] as const
  const STATES = ['défaut', 'désactivé', 'chargement'] as const
</script>

<Section id="boutons" title="Boutons">
  <p class="mb-4">
    Boutons de boilerplates-ui. Survol, focus et appui sont montrés état par état dans le
    <a class="bui-link" href="https://kewinmarchand.github.io/boilerplates-ui/" rel="external"
      >Storybook de la bibliothèque</a
    >.
  </p>
  <div class="overflow-x-auto">
    <table class="w-full border-separate border-spacing-2 text-left">
      <thead>
        <tr>
          <th scope="col">Variante</th>
          {#each STATES as state (state)}
            <th scope="col" class="text-body-sm">{state}</th>
          {/each}
          <th scope="col" class="text-body-sm">icône seule</th>
        </tr>
      </thead>
      <tbody>
        {#each VARIANTS as variant (variant)}
          <tr>
            <th scope="row" class="text-body-sm"><code>{variant}</code></th>
            {#each STATES as state (state)}
              <td>
                <Button {variant} disabled={state === 'désactivé'} loading={state === 'chargement'}>
                  Action
                </Button>
              </td>
            {/each}
            <td>
              <IconButton {variant} icon="x" label="Fermer" />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="mt-6 mb-2">Sur la couleur primaire (en-tête, héros) :</p>
  <div class="flex flex-wrap gap-2 rounded-md bg-primary p-4">
    <Button variant="inverse">Inverse</Button>
    <Button variant="nav">Navigation</Button>
  </div>
</Section>
