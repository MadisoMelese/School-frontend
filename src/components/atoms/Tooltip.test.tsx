import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip Component', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('shows tooltip on mouse enter', async () => {
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button.parentElement!)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })
  })

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button.parentElement!)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    fireEvent.mouseLeave(button.parentElement!)

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
    })
  })

  it('respects delay prop', async () => {
    vi.useFakeTimers()
    render(
      <Tooltip content="Tooltip content" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button.parentElement!)

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(screen.getByText('Tooltip content')).toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('has tooltip role', async () => {
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )
    const button = screen.getByText('Hover me')
    fireEvent.mouseEnter(button.parentElement!)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('applies position styles', async () => {
    const { rerender } = render(
      <Tooltip content="Tooltip" position="top" delay={0}>
        <button>Hover</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Hover').parentElement!)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveClass('bottom-full')
    })

    rerender(
      <Tooltip content="Tooltip" position="bottom" delay={0}>
        <button>Hover</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Hover').parentElement!)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveClass('top-full')
    })
  })

  it('has animate-fade-in class', async () => {
    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveClass('animate-fade-in')
    })
  })
})
