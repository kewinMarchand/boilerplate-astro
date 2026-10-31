<script lang="ts">
  import { CATALOG_NAVIGATION } from '@/shared/config'
  import { resolveHref } from '@/shared/routing'
  import { Icon } from '@/shared/ui/kit'

  import { useAnchoredPanel } from './hooks/useAnchoredPanel.svelte'
  import { useCascadeMenu } from './hooks/useCascadeMenu.svelte'

  import type { NavigationNode } from '@/shared/config'

  interface Props {
    nodes: NavigationNode[]
  }

  const { nodes }: Props = $props()

  const panelId = $props.id()
  const menu = useCascadeMenu(() => nodes)
  let root = $state<HTMLElement | null>(null)
  let toggleButton = $state<HTMLButtonElement | null>(null)
  let panel = $state<HTMLElement | null>(null)
  const anchored = useAnchoredPanel(
    () => root,
    () => panel,
    () => menu.columns.length,
  )

  const columnId = (level: number) => `${panelId}-column-${level}`

  const closeAndFocus = () => {
    menu.close()
    toggleButton?.focus()
  }

  const handleWindowKeydown = (event: KeyboardEvent) => {
    if (menu.open && event.key === 'Escape') closeAndFocus()
  }

  const handleWindowPointerdown = (event: PointerEvent) => {
    if (menu.open && event.target instanceof Node && !root?.contains(event.target)) menu.close()
  }

  const focusLinkIn = (level: number, index: number) => {
    const links = root?.querySelectorAll<HTMLAnchorElement>(`#${CSS.escape(columnId(level))} a`)
    links?.[Math.max(0, Math.min(index, links.length - 1))]?.focus()
  }

  const handlePanelKeydown = (event: KeyboardEvent) => {
    const link = event.target instanceof HTMLAnchorElement ? event.target : null
    const column = link?.closest<HTMLElement>('[data-column]')
    if (!link || !column) return
    const level = Number(column.dataset.column)
    const links = [...column.querySelectorAll('a')]
    const index = links.indexOf(link)
    const moves: Record<string, () => void> = {
      ArrowDown: () => focusLinkIn(level, index + 1),
      ArrowUp: () => focusLinkIn(level, index - 1),
      ArrowRight: () => focusLinkIn(level + 1, 0),
      ArrowLeft: () =>
        root
          ?.querySelector<HTMLAnchorElement>(
            `#${CSS.escape(columnId(level - 1))} a[aria-expanded='true']`,
          )
          ?.focus(),
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      move()
    }
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} onpointerdown={handleWindowPointerdown} />

<div class="relative" bind:this={root}>
  <button
    type="button"
    class="bui-button bui-button--nav"
    aria-expanded={menu.open}
    aria-controls={menu.open ? panelId : undefined}
    data-testid="layout-category-menu-toggle"
    bind:this={toggleButton}
    onclick={menu.toggle}
  >
    {CATALOG_NAVIGATION.label}
    <Icon name="chevron-down" class="bui-icon--md" />
  </button>
  {#if menu.open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      id={panelId}
      class={['category-menu', anchored.alignRight && 'category-menu-end']}
      data-testid="layout-category-menu"
      bind:this={panel}
      onkeydown={handlePanelKeydown}
    >
      <a href={resolveHref(CATALOG_NAVIGATION.href)} class="category-menu-all" onclick={menu.close}>
        Tout le catalogue
      </a>
      <div class="flex">
        {#each menu.columns as column, level (level)}
          <ul id={columnId(level)} class="category-menu-column" data-column={level}>
            {#each column as node (node.id)}
              {@const expanded = menu.isExpanded(level, node.id)}
              <li>
                <a
                  href={resolveHref(node.path)}
                  class="category-menu-link"
                  aria-expanded={node.children.length > 0 ? expanded : undefined}
                  aria-controls={expanded ? columnId(level + 1) : undefined}
                  data-testid="layout-category-link"
                  onmouseenter={() => menu.activate(level, node)}
                  onfocus={() => menu.activate(level, node)}
                  onclick={menu.close}
                >
                  {node.label}
                  {#if node.children.length > 0}
                    <Icon name="chevron-right" />
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        {/each}
      </div>
    </div>
  {/if}
</div>
