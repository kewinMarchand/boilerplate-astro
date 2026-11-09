<script lang="ts">
  import { CATALOG_NAVIGATION, isActivePath } from '@/shared/config'
  import { format } from '@/shared/i18n'
  import { resolveHref } from '@/shared/routing'
  import { Button, Drawer, Icon } from '@/shared/ui/kit'

  import { useDrillDown } from './hooks/useDrillDown.svelte'

  import type { NavigationNode } from '@/shared/config'
  import type { AppPath } from '@/shared/routing'

  interface Props {
    nodes: NavigationNode[]
    pathname: string
    /** Libellés dans la langue de la page, liens de la navigation principale compris. */
    labels: {
      menu: string
      close: string
      mobileMenu: string
      back: string
      wholeCategory: string
      navigation: string
      catalog: string
      items: { href: AppPath; label: string }[]
    }
  }

  const { nodes, pathname, labels }: Props = $props()

  let open = $state(false)
  let heading = $state<HTMLElement | null>(null)
  const drill = useDrillDown(() => heading?.focus())

  const catalogNode = $derived<NavigationNode>({
    id: 'catalogue',
    label: labels.catalog,
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
  title={labels.menu}
  closeLabel={labels.close}
  triggerClass="bui-button bui-button--nav bui-button--icon"
  triggerLabel={labels.menu}
  triggerTestId="layout-mobile-menu-toggle"
  panelTestId="layout-mobile-menu"
>
  {#snippet trigger()}
    <Icon name="menu" />
  {/snippet}

  <nav aria-label={labels.mobileMenu}>
    {#if drill.current}
      {@const current = drill.current}
      <Button
        variant="ghost"
        icon="chevron-left"
        class="mb-2"
        data-testid="layout-mobile-menu-back"
        onclick={drill.back}
      >
        {format(labels.back, { parent: drill.parentLabel ?? labels.menu })}
      </Button>
      <h2 class="mb-2 text-title font-semibold" tabindex="-1" bind:this={heading}>
        {current.label}
      </h2>
      <ul class="flex flex-col">
        <li>
          <a href={resolveHref(current.path)} class="mobile-menu-item" onclick={close}>
            {labels.wholeCategory}
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
      <h2 class="sr-only" tabindex="-1" bind:this={heading}>{labels.navigation}</h2>
      <ul class="flex flex-col">
        {#each labels.items as item (item.href)}
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
            {labels.catalog}
            <Icon name="chevron-right" />
          </button>
        </li>
      </ul>
    {/if}
  </nav>
</Drawer>
