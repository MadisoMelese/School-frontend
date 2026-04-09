import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner Component', () => {
  it('renders spinner element', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('applies size styles', () => {
    const { rerender } = render(<Spinner size="sm" />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-4')

    rerender(<Spinner size="md" />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-6')

    rerender(<Spinner size="lg" />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('w-8')
  })

  it('applies color styles', () => {
    const { rerender } = render(<Spinner color="primary" />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('text-primary-500')

    rerender(<Spinner color="secondary" />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('text-secondary-500')

    rerender(<Spinner color="neutral" />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('text-neutral-500')
  })

  it('has animate-spin class', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('animate-spin')
  })

  it('renders with default label', () => {
    render(<Spinner />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<Spinner label="Saving..." />)
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('has aria-label attribute', () => {
    render(<Spinner label="Loading data" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data')
  })

  it('renders SVG with circle and path', () => {
    render(<Spinner />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg?.querySelector('circle')).toBeInTheDocument()
    expect(svg?.querySelector('path')).toBeInTheDocument()
  })
})
