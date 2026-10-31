import { onMount } from 'svelte'

import { applyA11yMode, isEnhancedModeActive } from './a11yMode'

export const useA11yMode = () => {
  let enhanced = $state(false)

  onMount(() => {
    enhanced = isEnhancedModeActive()
  })

  return {
    get enhanced() {
      return enhanced
    },
    toggle() {
      enhanced = !enhanced
      applyA11yMode(enhanced)
    },
  }
}
