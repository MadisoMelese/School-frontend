import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar Component', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders initials when no src provided', () => {
    render(<Avatar name="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders single initial for single name', () => {
    render(<Avatar name="John" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders question mark when no name or src', () => {
    render(<Avatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('applies size styles', () => {
    const { rerender } = render(<Avatar name="JD" size="sm" />)
    expect(screen.getByRole('img')).toHaveClass('w-8')

    rerender(<Avatar name="JD" size="md" />)
    expect(screen.getByRole('img')).toHaveClass('w-10')

    rerender(<Avatar name="JD" size="lg" />)
    expect(screen.getByRole('img')).toHaveClass('w-12')
  })

  it('has rounded-full class', () => {
    render(<Avatar name="JD" />)
    expect(screen.getByRole('img')).toHaveClass('rounded-full')
  })

  it('sets aria-label from name', () => {
    render(<Avatar name="John Doe" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'John Doe')
  })

  it('uses alt text for image', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'User Avatar')
  })

  it('has lazy loading enabled', () => {
    render(<Avatar src="https://example.com/avatar.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
  })
})
