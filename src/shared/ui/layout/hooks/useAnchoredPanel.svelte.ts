export const useAnchoredPanel = (
  getAnchor: () => HTMLElement | null,
  getPanel: () => HTMLElement | null,
  getLayoutKey: () => unknown,
) => {
  let alignRight = $state(false)

  $effect(() => {
    getLayoutKey()
    const anchor = getAnchor()
    const panel = getPanel()
    if (!anchor || !panel) return
    const overflow = anchor.getBoundingClientRect().left + panel.scrollWidth
    alignRight = overflow > document.documentElement.clientWidth
  })

  return {
    get alignRight() {
      return alignRight
    },
  }
}
