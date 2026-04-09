import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge Component', () => {
  it('renders with children', () => {
    render(<Badge>Success</Badge>)
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('applies success variant styles', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-success-100')
  })

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warning</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-warning-100')
  })

  it('applies danger variant styles', () => {
    render(<Badge variant="danger">Danger</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-danger-100')
  })

  it('applies info variant styles', () => {
    render(<Badge variant="info">Info</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-primary-100')
  })

  it('applies neutral variant styles by default', () => {
    render(<Badge>Neutral</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toHaveClass('bg-neutral-100')
  })

  it('applies size styles', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>)
    expect(screen.getByRole('status')).toHaveClass('px-2')

    rerender(<Badge size="md">Medium</Badge>)
    expect(screen.getByRole('status')).toHaveClass('px-3')

    rerender(<Badge size="lg">Large</Badge>)
    expect(screen.getByRole('status')).toHaveClass('px-4')
  })

  it('renders with icon', () => {
    render(
      <Badge icon={<span data-testid="icon">✓</span>}>
        With Icon
      </Badge>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('has role status', () => {
    render(<Badge>Status</Badge>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
