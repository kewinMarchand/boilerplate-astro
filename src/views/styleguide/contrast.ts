export type ContrastLevel = 'AAA' | 'AA' | 'insuffisant'

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

const parseHex = (hex: string): [number, number, number] | null => {
  const value = hex.trim()
  if (!HEX_PATTERN.test(value)) return null
  const digits = value.slice(1)
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ]
}

const channelLuminance = (channel: number) => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export const relativeLuminance = (hex: string) => {
  const rgb = parseHex(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.map(channelLuminance) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrastRatio = (foreground: string, background: string) => {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  if (a === null || b === null) return null
  const [light, dark] = a > b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}

export const contrastLevel = (ratio: number): ContrastLevel => {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'insuffisant'
}
