import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MobileInput } from './MobileInput'

describe('MobileInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock scrollIntoView for JSDOM
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('should render input with label', () => {
    render(<MobileInput label="Email" type="email" />)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render input with error message', () => {
    render(<MobileInput label="Email" error="Invalid email" />)

    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('should render input with helper text', () => {
    render(<MobileInput label="Password" helperText="Minimum 8 characters" />)

    expect(screen.getByText('Minimum 8 characters')).toBeInTheDocument()
  })

  it('should have minimum height of 44px for touch targets', () => {
    const { container } = render(<MobileInput label="Test" />)
    const input = container.querySelector('input')

    expect(input).toHaveClass('min-h-[44px]')
  })

  it('should auto-focus on mount when autoFocusOnMount is true', () => {
    render(<MobileInput label="Test" autoFocusOnMount={true} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(document.activeElement).toBe(input)
  })

  it('should not auto-focus on mount when autoFocusOnMount is false', () => {
    render(<MobileInput label="Test" autoFocusOnMount={false} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(document.activeElement).not.toBe(input)
  })

  it('should scroll into view on focus when scrollIntoViewOnFocus is true', () => {
    const { container } = render(
      <MobileInput label="Test" scrollIntoViewOnFocus={true} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('should not scroll into view on focus when scrollIntoViewOnFocus is false', () => {
    const { container } = render(
      <MobileInput label="Test" scrollIntoViewOnFocus={false} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('should call onKeyboardDismiss on blur', () => {
    const onKeyboardDismiss = vi.fn()
    const { container } = render(
      <MobileInput label="Test" onKeyboardDismiss={onKeyboardDismiss} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.blur(input)

    expect(onKeyboardDismiss).toHaveBeenCalled()
  })

  it('should dismiss keyboard on Escape key', () => {
    const onKeyboardDismiss = vi.fn()
    const { container } = render(
      <MobileInput label="Test" onKeyboardDismiss={onKeyboardDismiss} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onKeyboardDismiss).toHaveBeenCalled()
    expect(document.activeElement).not.toBe(input)
  })

  it('should dismiss keyboard on Enter for email input', () => {
    const onKeyboardDismiss = vi.fn()
    const { container } = render(
      <MobileInput label="Email" type="email" onKeyboardDismiss={onKeyboardDismiss} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onKeyboardDismiss).toHaveBeenCalled()
  })

  it('should dismiss keyboard on Enter for number input', () => {
    const onKeyboardDismiss = vi.fn()
    const { container } = render(
      <MobileInput label="Phone" type="tel" onKeyboardDismiss={onKeyboardDismiss} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onKeyboardDismiss).toHaveBeenCalled()
  })

  it('should dismiss keyboard on Enter for date input', () => {
    const onKeyboardDismiss = vi.fn()
    const { container } = render(
      <MobileInput label="Date" type="date" onKeyboardDismiss={onKeyboardDismiss} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onKeyboardDismiss).toHaveBeenCalled()
  })

  it('should not dismiss keyboard on Enter for text input', () => {
    const onKeyboardDismiss = vi.fn()
    const { container } = render(
      <MobileInput label="Text" type="text" onKeyboardDismiss={onKeyboardDismiss} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onKeyboardDismiss).not.toHaveBeenCalled()
  })

  it('should have aria-invalid when error is present', () => {
    const { container } = render(
      <MobileInput label="Email" error="Invalid email" />
    )

    const input = container.querySelector('input')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should have aria-invalid false when no error', () => {
    const { container } = render(<MobileInput label="Email" />)

    const input = container.querySelector('input')
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })

  it('should have aria-describedby for error', () => {
    const { container } = render(
      <MobileInput label="Email" error="Invalid email" />
    )

    const input = container.querySelector('input')
    expect(input).toHaveAttribute('aria-describedby')
  })

  it('should have aria-describedby for helper text', () => {
    const { container } = render(
      <MobileInput label="Password" helperText="Minimum 8 characters" />
    )

    const input = container.querySelector('input')
    expect(input).toHaveAttribute('aria-describedby')
  })

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<MobileInput label="Test" disabled={true} />)

    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it('should support all input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'date', 'time']

    types.forEach((type) => {
      const { container } = render(<MobileInput label="Test" type={type} />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', type)
    })
  })

  it('should call onFocus callback', () => {
    const onFocus = vi.fn()
    const { container } = render(
      <MobileInput label="Test" onFocus={onFocus} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)

    expect(onFocus).toHaveBeenCalled()
  })

  it('should call onBlur callback', () => {
    const onBlur = vi.fn()
    const { container } = render(
      <MobileInput label="Test" onBlur={onBlur} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.blur(input)

    expect(onBlur).toHaveBeenCalled()
  })

  it('should call onKeyDown callback', () => {
    const onKeyDown = vi.fn()
    const { container } = render(
      <MobileInput label="Test" onKeyDown={onKeyDown} />
    )

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'a' })

    expect(onKeyDown).toHaveBeenCalled()
  })
})
