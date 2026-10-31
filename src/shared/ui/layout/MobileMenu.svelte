<script lang="ts">
  import { CATALOG_NAVIGATION, isActivePath, MAIN_NAVIGATION } from '@/shared/config'
  import { resolveHref } from '@/shared/routing'
  import { Button, Drawer, Icon } from '@/shared/ui/kit'

  import { useDrillDown } from './hooks/useDrillDown.svelte'

  import type { NavigationNode } from '@/shared/config'

  interface Props {
    nodes: NavigationNode[]
    pathname: string
  }

  const { nodes, pathname }: Props = $props()

  let open = $state(false)
  let heading = $state<HTMLElement | null>(null)
  const drill = useDrillDown(() => heading?.focus())

  const catalogNode = $derived<NavigationNode>({
    id: 'catalogue',
    label: CATALOG_NAVIGATION.label,
    path: CATALOG_NAVIGATION.href,
    children: nodes,
  })

  $effect(() => {
    if (!open) drill.reset()
  })

  const close = () => {
    open = false
  }
</script>

<Drawer
  bind:open
  title="Menu"
  triggerClass="bui-button bui-button--nav bui-button--icon"
  triggerLabel="Menu"
  triggerTestId="layout-mobile-menu-toggle"
  panelTestId="layout-mobile-menu"
>
  {#snippet trigger()}
    <Icon name="menu" />
  {/snippet}

  <nav aria-label="Menu mobile">
    {#if drill.current}
      {@const current = drill.current}
      <Button
        variant="ghost"
        icon="chevron-left"
        class="mb-2"
        data-testid="layout-mobile-menu-back"
        onclick={drill.back}
      >
        Retour à {drill.parentLabel ?? 'Menu'}
      </Button>
      <h2 class="mb-2 text-title font-semibold" tabindex="-1" bind:this={heading}>
        {current.label}
      </h2>
      <ul class="flex flex-col">
        <li>
          <a href={resolveHref(current.path)} class="mobile-menu-item" onclick={close}>
            Voir toute la catégorie
          </a>
        </li>
        {#each current.children as node (node.id)}
          <li>
            {#if node.children.length > 0}
              <button type="button" class="mobile-menu-item" onclick={() => drill.open(node)}>
                {node.label}
                <Icon name="chevron-right" />
              </button>
            {:else}
              <a href={resolveHref(node.path)} class="mobile-menu-item" onclick={close}
                >{node.label}</a
              >
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <h2 class="sr-only" tabindex="-1" bind:this={heading}>Navigation</h2>
      <ul class="flex flex-col">
        {#each MAIN_NAVIGATION as item (item.href)}
          <li>
            <a
              href={resolveHref(item.href)}
              class="mobile-menu-item"
              aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
              onclick={close}>{item.label}</a
            >
          </li>
        {/each}
        <li>
          <button type="button" class="mobile-menu-item" onclick={() => drill.open(catalogNode)}>
            {CATALOG_NAVIGATION.label}
            <Icon name="chevron-right" />
          </button>
        </li>
      </ul>
    {/if}
  </nav>
</Drawer>
