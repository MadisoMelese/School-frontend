import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './Label'

describe('Label Component', () => {
  it('renders with children', () => {
    render(<Label>Email Address</Label>)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('renders required indicator when required prop is true', () => {
    render(<Label required>Email Address</Label>)
    expect(screen.getByLabelText('required')).toBeInTheDocument()
  })

  it('does not render required indicator when required prop is false', () => {
    render(<Label required={false}>Email Address</Label>)
    expect(screen.queryByLabelText('required')).not.toBeInTheDocument()
  })

  it('sets htmlFor attribute', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input')
  })

  it('applies font-medium class', () => {
    render(<Label>Label</Label>)
    expect(screen.getByText('Label')).toHaveClass('font-medium')
  })

  it('applies text-neutral-700 class', () => {
    render(<Label>Label</Label>)
    expect(screen.getByText('Label')).toHaveClass('text-neutral-700')
  })

  it('applies block display', () => {
    render(<Label>Label</Label>)
    expect(screen.getByText('Label')).toHaveClass('block')
  })

  it('renders as label element', () => {
    render(<Label>Label</Label>)
    expect(screen.getByText('Label').tagName).toBe('LABEL')
  })

  it('accepts custom className', () => {
    render(<Label className="custom-class">Label</Label>)
    expect(screen.getByText('Label')).toHaveClass('custom-class')
  })
})
