import { onMount } from 'svelte'
import { MediaQuery } from 'svelte/reactivity'

const DESKTOP_QUERY = '(min-width: 1024px)'

export const useIsDesktop = () => {
  const query = new MediaQuery(DESKTOP_QUERY, true)
  let mounted = $state(false)

  onMount(() => {
    mounted = true
  })

  return {
    get mounted() {
      return mounted
    },
    get current() {
      return mounted ? query.current : true
    },
  }
}
