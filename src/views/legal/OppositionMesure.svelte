<script lang="ts">
  import { useOppositionMesure } from '@/shared/observability'
  import { Checkbox } from '@/shared/ui/kit'

  const opposition = useOppositionMesure()
  const id = $props.id()
</script>

<Checkbox
  {id}
  label="Ne pas mesurer mes visites sur ce site"
  checked={opposition.refusee}
  data-testid="legal-opposition-mesure"
  onchange={(event) => opposition.changer(event.currentTarget.checked)}
/>
<p role="status" aria-live="polite" data-testid="legal-opposition-etat">
  {opposition.refusee
    ? 'Vos visites ne sont plus mesurées depuis ce navigateur.'
    : 'Vos visites sont mesurées, de façon anonyme.'}
</p>
