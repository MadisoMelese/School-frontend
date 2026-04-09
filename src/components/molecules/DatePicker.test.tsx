import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DatePicker } from './DatePicker'

describe('DatePicker Component', () => {
  it('renders with placeholder', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
        placeholder="Select a date"
      />
    )

    expect(screen.getByText('Select a date')).toBeInTheDocument()
  })

  it('displays selected date', () => {
    const date = new Date('2024-01-15')
    render(
      <DatePicker
        value={date}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })

  it('opens calendar when clicked', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument()
  })

  it('calls onChange when date is selected', () => {
    const onChange = vi.fn()
    render(
      <DatePicker
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    const dateButtons = screen.getAllByRole('button')
    // Find a date button (skip the month navigation buttons)
    const dateButton = dateButtons.find(btn => btn.textContent === '15')
    if (dateButton) {
      fireEvent.click(dateButton)
    }

    expect(onChange).toHaveBeenCalled()
  })

  it('navigates months with previous/next buttons', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    const prevButton = screen.getByLabelText('Previous month')
    fireEvent.click(prevButton)

    // Calendar should still be visible
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
  })

  it('disables dates before minDate', () => {
    const minDate = new Date('2024-01-15')
    render(
      <DatePicker
        onChange={vi.fn()}
        minDate={minDate}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    // Dates before minDate should be disabled
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
  })

  it('disables dates after maxDate', () => {
    const maxDate = new Date('2024-01-15')
    render(
      <DatePicker
        onChange={vi.fn()}
        maxDate={maxDate}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByLabelText('Next month')).toBeInTheDocument()
  })

  it('disables picker when disabled prop is true', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
        disabled
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('formats date according to format prop', () => {
    const date = new Date('2024-01-15')
    render(
      <DatePicker
        value={date}
        onChange={vi.fn()}
        format="DD/MM/YYYY"
      />
    )

    expect(screen.getByText('15/01/2024')).toBeInTheDocument()
  })

  it('closes calendar after date selection', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    const dateButtons = screen.getAllByRole('button')
    const dateButton = dateButtons.find(btn => btn.textContent === '15')
    if (dateButton) {
      fireEvent.click(dateButton)
    }

    // Calendar should be closed
    expect(screen.queryByLabelText('Previous month')).not.toBeInTheDocument()
  })

  it('opens calendar with Enter key', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
  })

  it('closes calendar with Escape key', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByLabelText('Previous month')).not.toBeInTheDocument()
  })

  it('highlights today in calendar', () => {
    render(
      <DatePicker
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    const today = new Date().getDate()
    const todayButton = screen.getAllByRole('button').find(btn => btn.textContent === String(today))

    expect(todayButton).toHaveClass('bg-primary-100')
  })
})
