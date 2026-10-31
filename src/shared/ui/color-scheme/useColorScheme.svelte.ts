import { onMount } from 'svelte'

import { isEnhancedModeActive } from '@/shared/ui/a11y-mode'

import { applyColorScheme, type ColorScheme, currentColorScheme } from './colorScheme'

/** Thème choisi et état du mode renforcé, qui le suspend : les deux suivis sur <html>. */
export const useColorScheme = () => {
  let scheme = $state<ColorScheme>('auto')
  let enhanced = $state(false)

  onMount(() => {
    const read = () => {
      scheme = currentColorScheme()
      enhanced = isEnhancedModeActive()
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-scheme', 'data-a11y-mode'],
    })
    return () => observer.disconnect()
  })

  return {
    get scheme() {
      return scheme
    },
    get enhanced() {
      return enhanced
    },
    choose(next: ColorScheme) {
      scheme = next
      applyColorScheme(next)
    },
  }
}
