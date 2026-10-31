export const COLOR_TOKENS = [
  'primary',
  'primary-dark',
  'secondary',
  'text',
  'text-muted',
  'surface',
  'surface-muted',
  'border',
  'success',
  'error',
  'warning',
  'info',
] as const

export const SPACING_STEPS = [1, 2, 3, 4, 6, 8, 12, 16] as const

export const TYPE_SAMPLES = [
  { tag: 'h1', className: 'text-h1', label: 'Titre de niveau 1' },
  { tag: 'h2', className: 'text-h2', label: 'Titre de niveau 2' },
  { tag: 'h3', className: 'text-title font-semibold', label: 'Titre de niveau 3' },
  { tag: 'h4', className: 'text-body font-semibold', label: 'Titre de niveau 4' },
  { tag: 'h5', className: 'text-body-sm font-semibold', label: 'Titre de niveau 5' },
  { tag: 'h6', className: 'text-body-sm font-semibold uppercase', label: 'Titre de niveau 6' },
  { tag: 'p', className: 'text-body', label: 'Corps de texte' },
  { tag: 'p', className: 'text-body-sm', label: 'Petit texte' },
] as const
