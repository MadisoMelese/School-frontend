import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card, CardHeader, CardBody, CardFooter } from './Card'

describe('Card Component', () => {
  it('renders card with children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders header when provided', () => {
    render(<Card header="Card Title">Content</Card>)
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(<Card footer="Card Footer">Content</Card>)
    expect(screen.getByText('Card Footer')).toBeInTheDocument()
  })

  it('renders all sections together', () => {
    render(
      <Card header="Title" footer="Footer">
        Body content
      </Card>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Click me</Card>)

    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalled()
  })

  it('applies hoverable styles when hoverable prop is true', () => {
    const { container } = render(<Card hoverable>Content</Card>)
    const card = container.querySelector('article')

    expect(card).toHaveClass('hover:shadow-md')
  })

  it('handles keyboard interaction when clickable', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Click me</Card>)

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })

    expect(onClick).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    const card = container.querySelector('article')

    expect(card).toHaveClass('custom-class')
  })

  it('uses semantic article element', () => {
    render(<Card>Content</Card>)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })
})

describe('CardHeader Component', () => {
  it('renders header content', () => {
    render(<CardHeader>Header Title</CardHeader>)
    expect(screen.getByText('Header Title')).toBeInTheDocument()
  })
})

describe('CardBody Component', () => {
  it('renders body content', () => {
    render(<CardBody>Body content</CardBody>)
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })
})

describe('CardFooter Component', () => {
  it('renders footer content', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })
})
