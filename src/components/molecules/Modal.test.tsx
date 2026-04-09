import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Modal content
      </Modal>
    )

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal Title">
        Content
      </Modal>
    )

    expect(screen.getByText('Modal Title')).toBeInTheDocument()
  })

  it('renders close button when closeButton is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} closeButton={true}>
        Content
      </Modal>
    )

    expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} closeButton={true}>
        Content
      </Modal>
    )

    fireEvent.click(screen.getByLabelText('Close modal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        Content
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('renders actions when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} actions={<button>Action</button>}>
        Content
      </Modal>
    )

    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('applies correct size class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        Content
      </Modal>
    )

    const modal = container.querySelector('[role="dialog"]')
    expect(modal).toHaveClass('max-w-lg')
  })

  it('has proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('calls onBackdropClick when backdrop is clicked', () => {
    const onBackdropClick = vi.fn()
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} onBackdropClick={onBackdropClick}>
        Content
      </Modal>
    )

    const backdrop = container.querySelector('[role="presentation"]')
    fireEvent.click(backdrop!)

    expect(onBackdropClick).toHaveBeenCalled()
  })

  it('hides body overflow when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Content
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')
  })
})
