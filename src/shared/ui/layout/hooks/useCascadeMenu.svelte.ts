import type { NavigationNode } from '@/shared/config'

export const useCascadeMenu = (getRoots: () => NavigationNode[]) => {
  let open = $state(false)
  let openIds = $state<string[]>([])

  const columns = $derived.by(() => {
    const result = [getRoots()]
    for (const id of openIds) {
      const node = result.at(-1)?.find((candidate) => candidate.id === id)
      if (!node || node.children.length === 0) break
      result.push(node.children)
    }
    return result
  })

  const close = () => {
    open = false
    openIds = []
  }

  return {
    get open() {
      return open
    },
    get columns() {
      return columns
    },
    isExpanded(level: number, id: string) {
      return openIds[level] === id
    },
    activate(level: number, node: NavigationNode) {
      const kept = openIds.slice(0, level)
      openIds = node.children.length > 0 ? [...kept, node.id] : kept
    },
    toggle() {
      if (open) close()
      else open = true
    },
    close,
  }
}
