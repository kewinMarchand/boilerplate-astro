<script lang="ts">
  import { Button, Icon } from '@/shared/ui/kit'

  import { useA11yMode } from './useA11yMode.svelte'

  const mode = useA11yMode()
</script>

<Button
  variant="nav"
  class="max-lg:size-touch max-lg:shrink-0 max-lg:px-0"
  aria-label="Accessibilité renforcée"
  aria-pressed={mode.enhanced}
  onclick={mode.toggle}
  data-testid="a11y-mode-toggle"
>
  <Icon name="person-standing" class="bui-icon--md" />
  <span class="max-lg:sr-only">Accessibilité renforcée</span>
</Button>
