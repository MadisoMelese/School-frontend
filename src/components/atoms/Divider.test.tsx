import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Divider } from './Divider'

describe('Divider Component', () => {
  it('renders horizontal divider by default', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('renders vertical divider when orientation is vertical', () => {
    render(<Divider orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('renders with label', () => {
    render(<Divider label="OR" />)
    expect(screen.getByText('OR')).toBeInTheDocument()
  })

  it('has separator role', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('applies horizontal styles', () => {
    render(<Divider />)
    const divider = screen.getByRole('separator')
    expect(divider).toHaveClass('h-px')
    expect(divider).toHaveClass('bg-neutral-200')
  })

  it('applies vertical styles', () => {
    render(<Divider orientation="vertical" />)
    const divider = screen.getByRole('separator')
    expect(divider).toHaveClass('h-full')
    expect(divider).toHaveClass('w-px')
  })

  it('renders label with flex layout', () => {
    render(<Divider label="OR" />)
    const divider = screen.getByRole('separator')
    expect(divider).toHaveClass('flex')
    expect(divider).toHaveClass('items-center')
  })

  it('accepts custom className', () => {
    render(<Divider className="custom-class" />)
    expect(screen.getByRole('separator')).toHaveClass('custom-class')
  })
})
