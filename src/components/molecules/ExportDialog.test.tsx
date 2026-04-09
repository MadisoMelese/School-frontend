import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportDialog } from './ExportDialog'

describe('ExportDialog', () => {
  const mockColumns = [
    { key: 'name', label: 'Name', selected: true },
    { key: 'email', label: 'Email', selected: true },
    { key: 'phone', label: 'Phone', selected: false },
  ]

  const mockOnExport = vi.fn()
  const mockOnClose = vi.fn()

  it('renders export dialog', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    expect(screen.getByText('Export Data')).toBeInTheDocument()
  })

  it('displays format options', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    expect(screen.getByText('Export Format')).toBeInTheDocument()
  })

  it('displays all available columns', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  it('shows selected column count', () => {
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    expect(screen.getByText('2 of 3 columns selected')).toBeInTheDocument()
  })

  it('handles select all', async () => {
    const user = userEvent.setup()
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    
    const selectAllButton = screen.getByText('Select All')
    await user.click(selectAllButton)
    
    expect(screen.getByText('3 of 3 columns selected')).toBeInTheDocument()
  })

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onExport with correct options', async () => {
    const user = userEvent.setup()
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    
    const exportButton = screen.getByText(/Export CSV/i)
    await user.click(exportButton)
    
    expect(mockOnExport).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'csv',
        columns: expect.arrayContaining(['name', 'email']),
      })
    )
  })

  it('disables export when no columns selected', async () => {
    const user = userEvent.setup()
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    
    // Deselect all
    const selectAllButton = screen.getByText('Deselect All')
    await user.click(selectAllButton)
    
    const exportButton = screen.getByText(/Export CSV/i)
    expect(exportButton).toBeDisabled()
  })

  it('updates filename', async () => {
    const user = userEvent.setup()
    render(
      <ExportDialog
        isOpen={true}
        onClose={mockOnClose}
        onExport={mockOnExport}
        availableColumns={mockColumns}
      />
    )
    
    const filenameInput = screen.getByPlaceholderText('Enter filename')
    await user.clear(filenameInput)
    await user.type(filenameInput, 'my-export')
    
    expect(screen.getByText(/File will be saved as: my-export\.csv/)).toBeInTheDocument()
  })
})
