<script lang="ts">
  import type { IconName } from './iconNames'

  interface Props {
    name: IconName
    class?: string
  }

  const { name, class: className }: Props = $props()
</script>

<svg class={['bui-icon', className]} aria-hidden="true"><use href="/icons.svg#{name}"></use></svg>
