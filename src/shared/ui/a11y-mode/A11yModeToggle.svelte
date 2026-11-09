<script lang="ts">
  import { Button, Icon } from '@/shared/ui/kit'

  import { useA11yMode } from './useA11yMode.svelte'

  interface Props {
    /** Nom du bouton dans la langue de la page. */
    label: string
  }

  const { label }: Props = $props()
  const mode = useA11yMode()
</script>

<Button
  variant="nav"
  class="max-lg:size-touch max-lg:shrink-0 max-lg:px-0"
  aria-label={label}
  aria-pressed={mode.enhanced}
  onclick={mode.toggle}
  data-testid="a11y-mode-toggle"
>
  <Icon name="person-standing" class="bui-icon--md" />
  <span class="max-lg:sr-only">{label}</span>
</Button>
