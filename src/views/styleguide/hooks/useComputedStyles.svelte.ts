import { onMount } from 'svelte'

import { contrastLevel, contrastRatio } from '../contrast'

import type { ContrastLevel } from '../contrast'

export interface TokenSample {
  name: string
  value: string
  ratio: number | null
  level: ContrastLevel | null
}

const readToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--bui-color-${name}`).trim()

export const useColorTokens = (names: readonly string[]) => {
  let samples = $state<TokenSample[]>(
    names.map((name) => ({ name, value: '', ratio: null, level: null })),
  )

  const measure = () => {
    const background = readToken('surface')
    samples = names.map((name) => {
      const value = readToken(name)
      const ratio = contrastRatio(value, background)
      return { name, value, ratio, level: ratio === null ? null : contrastLevel(ratio) }
    })
  }

  onMount(() => {
    measure()
    const observer = new MutationObserver(measure)
    observer.observe(document.documentElement, { attributeFilter: ['data-a11y-mode'] })
    return () => observer.disconnect()
  })

  return {
    get samples() {
      return samples
    },
  }
}

export const useTypeMetrics = (getElements: () => (HTMLElement | null)[]) => {
  let metrics = $state<string[]>([])

  const measure = () => {
    metrics = getElements().map((element) => {
      if (!element) return ''
      const style = getComputedStyle(element)
      return `${style.fontSize} / ${style.lineHeight}`
    })
  }

  onMount(() => {
    measure()
    const observer = new MutationObserver(measure)
    observer.observe(document.documentElement, { attributeFilter: ['data-a11y-mode'] })
    return () => observer.disconnect()
  })

  return {
    get metrics() {
      return metrics
    },
  }
}
