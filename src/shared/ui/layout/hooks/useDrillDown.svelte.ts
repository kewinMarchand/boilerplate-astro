import { tick } from 'svelte'

import type { NavigationNode } from '@/shared/config'

export const useDrillDown = (focusHeading: () => void) => {
  let trail = $state<NavigationNode[]>([])

  const moveTo = async (next: NavigationNode[]) => {
    trail = next
    await tick()
    focusHeading()
  }

  return {
    get current() {
      return trail.at(-1)
    },
    get parentLabel() {
      return trail.at(-2)?.label
    },
    open(node: NavigationNode) {
      void moveTo([...trail, node])
    },
    back() {
      void moveTo(trail.slice(0, -1))
    },
    reset() {
      trail = []
    },
  }
}
