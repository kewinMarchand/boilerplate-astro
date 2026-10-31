import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import A11yModeToggle from './A11yModeToggle.svelte'

describe('A11yModeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.a11yMode
  })

  it('active puis désactive le mode renforcé', async () => {
    render(A11yModeToggle)
    const toggle = screen.getByTestId('a11y-mode-toggle')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.dataset.a11yMode).toBe('enhanced')
    expect(localStorage.getItem('a11y-mode')).toBe('enhanced')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement.dataset.a11yMode).toBeUndefined()
    expect(localStorage.getItem('a11y-mode')).toBeNull()
  })

  it('reprend l’état déjà posé sur la page', () => {
    document.documentElement.dataset.a11yMode = 'enhanced'
    render(A11yModeToggle)

    expect(screen.getByTestId('a11y-mode-toggle')).toHaveAttribute('aria-pressed', 'true')
  })
})
