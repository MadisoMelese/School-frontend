import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tag } from './Tag'

describe('Tag Component', () => {
  it('renders with children', () => {
    render(<Tag>React</Tag>)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    const { rerender } = render(<Tag variant="primary">Primary</Tag>)
    expect(screen.getByRole('status')).toHaveClass('bg-primary-100')

    rerender(<Tag variant="success">Success</Tag>)
    expect(screen.getByRole('status')).toHaveClass('bg-success-100')

    rerender(<Tag variant="danger">Danger</Tag>)
    expect(screen.getByRole('status')).toHaveClass('bg-danger-100')
  })

  it('applies size styles', () => {
    const { rerender } = render(<Tag size="sm">Small</Tag>)
    expect(screen.getByRole('status')).toHaveClass('px-2')

    rerender(<Tag size="md">Medium</Tag>)
    expect(screen.getByRole('status')).toHaveClass('px-3')

    rerender(<Tag size="lg">Large</Tag>)
    expect(screen.getByRole('status')).toHaveClass('px-4')
  })

  it('renders with icon', () => {
    render(
      <Tag icon={<span data-testid="tag-icon">✓</span>}>
        With Icon
      </Tag>
    )
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument()
  })

  it('renders remove button when onRemove is provided', () => {
    render(<Tag onRemove={() => {}}>Removable</Tag>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>Removable</Tag>)
    fireEvent.click(screen.getByRole('button'))
    expect(onRemove).toHaveBeenCalled()
  })

  it('does not render remove button when onRemove is not provided', () => {
    render(<Tag>Not Removable</Tag>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has role status', () => {
    render(<Tag>Tag</Tag>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has aria-label on remove button', () => {
    render(<Tag onRemove={() => {}}>Remove Me</Tag>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Remove Remove Me')
  })

  it('applies neutral variant by default', () => {
    render(<Tag>Default</Tag>)
    expect(screen.getByRole('status')).toHaveClass('bg-neutral-100')
  })
})
