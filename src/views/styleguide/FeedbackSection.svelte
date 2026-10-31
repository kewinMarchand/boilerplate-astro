<script lang="ts">
  import { Alert, Badge, Button, Icon, Skeleton } from '@/shared/ui/kit'

  import Section from './Section.svelte'
</script>

<Section id="retours" title="Retours">
  <div class="flex flex-col gap-4">
    <Alert variant="info">Le catalogue est mis à jour chaque lundi.</Alert>
    <Alert variant="success">Votre message a bien été envoyé.</Alert>
    <Alert variant="warning" title="Stock limité">Ce produit est bientôt épuisé.</Alert>
    <Alert variant="error">Impossible de charger les données.</Alert>
    <div role="status" aria-label="Exemple de chargement" class="flex flex-col gap-2">
      <Skeleton />
      <Skeleton variant="text" width="60%" />
    </div>
    <p class="flex flex-wrap gap-2">
      <Badge>Neutre</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Succès</Badge>
      <Badge variant="warning">Attention</Badge>
      <Badge variant="error">Rupture de stock</Badge>
    </p>
    <div class="flex flex-col items-start gap-3">
      <Alert variant="error">Le chargement a échoué.</Alert>
      <Button variant="outline"><Icon name="rotate-cw" />Réessayer</Button>
    </div>
  </div>
</Section>
