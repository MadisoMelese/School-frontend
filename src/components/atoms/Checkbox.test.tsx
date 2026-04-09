import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders checkbox input', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('handles checked state', async () => {
    const user = userEvent.setup()
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    
    expect(checkbox.checked).toBe(false)
    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('handles disabled state', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.disabled).toBe(true)
  })

  it('displays error message', () => {
    render(<Checkbox error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<Checkbox helperText="Check this box to continue" />)
    expect(screen.getByText('Check this box to continue')).toBeInTheDocument()
  })

  it('calls onChange handler', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Checkbox onChange={handleChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders different sizes', () => {
    const { rerender } = render(<Checkbox size="sm" />)
    let checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('w-4', 'h-4')

    rerender(<Checkbox size="md" />)
    checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('w-5', 'h-5')

    rerender(<Checkbox size="lg" />)
    checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('w-6', 'h-6')
  })
})
