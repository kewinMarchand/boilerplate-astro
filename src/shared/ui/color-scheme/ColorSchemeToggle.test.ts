import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import ColorSchemeToggle from './ColorSchemeToggle.svelte'

describe('ColorSchemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.colorScheme
    delete document.documentElement.dataset.a11yMode
  })

  it('suit le système par défaut', () => {
    render(ColorSchemeToggle)

    expect(screen.getByTestId('color-scheme-toggle')).toHaveAccessibleName('Thème : système')
    expect(screen.getByTestId('color-scheme-option-auto')).toHaveAttribute('aria-checked', 'true')
  })

  it('pose et mémorise le choix, puis « système » retire la clé', async () => {
    render(ColorSchemeToggle)
    const toggle = screen.getByTestId('color-scheme-toggle')

    await userEvent.click(toggle)
    await userEvent.click(screen.getByTestId('color-scheme-option-dark'))
    expect(toggle).toHaveAccessibleName('Thème : sombre')
    expect(document.documentElement.dataset.colorScheme).toBe('dark')
    expect(localStorage.getItem('color-scheme')).toBe('dark')

    await userEvent.click(toggle)
    await userEvent.click(screen.getByTestId('color-scheme-option-auto'))
    expect(toggle).toHaveAccessibleName('Thème : système')
    expect(localStorage.getItem('color-scheme')).toBeNull()
  })

  it('annonce un choix sombre suspendu par le mode renforcé', () => {
    document.documentElement.dataset.colorScheme = 'dark'
    document.documentElement.dataset.a11yMode = 'enhanced'
    render(ColorSchemeToggle)

    expect(screen.getByTestId('color-scheme-toggle')).toHaveAccessibleName(
      "Thème : sombre, suspendu par l'accessibilité renforcée",
    )
  })
})
