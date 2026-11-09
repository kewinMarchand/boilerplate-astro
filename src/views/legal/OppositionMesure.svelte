<script lang="ts">
  import { useOppositionMesure } from '@/shared/observability'
  import { Checkbox } from '@/shared/ui/kit'

  interface Props {
    /** Libellés dans la langue de la page. */
    labels: { opposition: string; refused: string; measured: string }
  }

  const { labels }: Props = $props()
  const opposition = useOppositionMesure()
  const id = $props.id()
</script>

<Checkbox
  {id}
  label={labels.opposition}
  checked={opposition.refusee}
  data-testid="legal-opposition-mesure"
  onchange={(event) => opposition.changer(event.currentTarget.checked)}
/>
<p role="status" aria-live="polite" data-testid="legal-opposition-etat">
  {opposition.refusee ? labels.refused : labels.measured}
</p>
