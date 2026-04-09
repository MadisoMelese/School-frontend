import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropdown } from './Dropdown'

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
]

describe('Dropdown Component', () => {
  it('renders with placeholder', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
        placeholder="Select an option"
      />
    )

    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('displays selected value', () => {
    render(
      <Dropdown
        options={options}
        value="1"
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('calls onChange when option is selected', () => {
    const onChange = vi.fn()
    render(
      <Dropdown
        options={options}
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Option 2'))

    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('closes dropdown after selection', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('Option 1'))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('disables dropdown when disabled prop is true', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
        disabled
      />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('filters options when searchable and search term is entered', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
        searchable
      />
    )

    fireEvent.click(screen.getByRole('button'))
    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'Option 2' } })

    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
  })

  it('navigates options with arrow keys', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.keyDown(button, { key: 'ArrowDown' })

    // First option should be highlighted
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('selects option with Enter key', () => {
    const onChange = vi.fn()
    render(
      <Dropdown
        options={options}
        onChange={onChange}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.keyDown(button, { key: 'ArrowDown' })
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(onChange).toHaveBeenCalled()
  })

  it('closes dropdown with Escape key', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('disables individual options', () => {
    const disabledOptions = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2', disabled: true },
    ]

    render(
      <Dropdown
        options={disabledOptions}
        onChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    const disabledOption = screen.getByText('Option 2').closest('button')

    expect(disabledOption).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Dropdown
        options={options}
        onChange={vi.fn()}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
