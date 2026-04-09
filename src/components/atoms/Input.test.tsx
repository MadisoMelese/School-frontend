import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('renders with helper text', () => {
    render(<Input helperText="Enter a valid email" />)
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
  })

  it('does not show helper text when error is present', () => {
    render(<Input error="Error" helperText="Helper" />)
    expect(screen.queryByText('Helper')).not.toBeInTheDocument()
  })

  it('applies error styles when error prop is set', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-danger-500')
  })

  it('applies normal styles when no error', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-neutral-300')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input error="Error" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-invalid to false when no error', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false')
  })

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('associates label with input via htmlFor', () => {
    render(<Input id="email-input" label="Email" />)
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('generates unique id when not provided', () => {
    const { rerender } = render(<Input label="Field 1" />)
    const input1 = screen.getByRole('textbox')
    const id1 = input1.id

    rerender(<Input label="Field 2" />)
    const input2 = screen.getByRole('textbox')
    const id2 = input2.id

    expect(id1).not.toBe(id2)
  })

  it('accepts type attribute', () => {
    render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('accepts placeholder attribute', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Enter text')
  })
})
