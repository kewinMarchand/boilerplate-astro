export const ROUTES = ['/'] as const

export const MODES = ['standard', 'dark', 'enhanced'] as const

export type Mode = (typeof MODES)[number]
