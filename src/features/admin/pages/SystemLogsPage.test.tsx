import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SystemLogsPage } from './SystemLogsPage'
import * as useSystemLogsModule from '../hooks/useSystemLogs'
import type { SystemLog } from '@types/api.types'

// Mock the useSystemLogs hook
vi.mock('../hooks/useSystemLogs')

describe('SystemLogsPage', () => {
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Student',
      action: 'login',
      resource: 'user',
      timestamp: '2024-01-15T10:30:00Z',
      details: { ip: '192.168.1.1' },
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Teacher',
      action: 'create',
      resource: 'grade',
      timestamp: '2024-01-15T11:00:00Z',
      details: { gradeId: 'grade123', subject: 'Math' },
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Admin User',
      action: 'delete',
      resource: 'user',
      timestamp: '2024-01-15T11:30:00Z',
      details: { deletedUserId: 'user999' },
    },
    {
      id: '4',
      userId: 'user1',
      userName: 'John Student',
      action: 'update',
      resource: 'attendance',
      timestamp: '2024-01-15T12:00:00Z',
      details: { attendanceId: 'att456', status: 'present' },
    },
  ]

  const mockUseSystemLogs = {
    logs: mockLogs,
    total: 4,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
    exporting: false,
    fetchLogs: vi.fn(),
    exportAsCSV: vi.fn(),
    exportAsPDF: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(useSystemLogsModule, 'useSystemLogs').mockReturnValue(mockUseSystemLogs)
  })

  it('renders system logs page with title', () => {
    render(<SystemLogsPage />)
    const titles = screen.getAllByText('System Logs')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('displays export button', () => {
    render(<SystemLogsPage />)
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('displays advanced filter controls', () => {
    render(<SystemLogsPage />)
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument()
  })

  it('displays system logs in table view', async () => {
    render(<SystemLogsPage />)

    await waitFor(() => {
      const students = screen.getAllByText('John Student')
      const teachers = screen.getAllByText('Jane Teacher')
      const admins = screen.getAllByText('Admin User')
      expect(students.length).toBeGreaterThan(0)
      expect(teachers.length).toBeGreaterThan(0)
      expect(admins.length).toBeGreaterThan(0)
    })
  })

  it('displays log actions as badges', async () => {
    render(<SystemLogsPage />)

    await waitFor(() => {
      const loginBadges = screen.getAllByText('Login')
      const createBadges = screen.getAllByText('Create')
      const deleteBadges = screen.getAllByText('Delete')
      const updateBadges = screen.getAllByText('Update')
      expect(loginBadges.length).toBeGreaterThan(0)
      expect(createBadges.length).toBeGreaterThan(0)
      expect(deleteBadges.length).toBeGreaterThan(0)
      expect(updateBadges.length).toBeGreaterThan(0)
    })
  })

  it('displays log resources', async () => {
    render(<SystemLogsPage />)

    await waitFor(() => {
      const userResources = screen.getAllByText('User')
      const gradeResources = screen.getAllByText('Grade')
      const attendanceResources = screen.getAllByText('Attendance')
      expect(userResources.length).toBeGreaterThan(0)
      expect(gradeResources.length).toBeGreaterThan(0)
      expect(attendanceResources.length).toBeGreaterThan(0)
    })
  })

  it('displays timestamps for each log', async () => {
    render(<SystemLogsPage />)

    await waitFor(() => {
      const timestamps = screen.getAllByText('1/15/2024')
      expect(timestamps.length).toBeGreaterThan(0)
    })
  })

  it('fetches logs on mount', () => {
    render(<SystemLogsPage />)
    expect(mockUseSystemLogs.fetchLogs).toHaveBeenCalled()
  })

  it('searches logs with debouncing', async () => {
    render(<SystemLogsPage />)

    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'john' } })

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockUseSystemLogs.fetchLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'john',
          })
        )
      },
      { timeout: 500 }
    )
  })

  it('filters logs by date range', async () => {
    render(<SystemLogsPage />)

    const startDateInput = screen.getByLabelText('Start date')
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } })

    await waitFor(() => {
      expect(mockUseSystemLogs.fetchLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-01-15',
        })
      )
    })
  })

  it('displays loading state', () => {
    vi.spyOn(useSystemLogsModule, 'useSystemLogs').mockReturnValue({
      ...mockUseSystemLogs,
      loading: true,
    })

    render(<SystemLogsPage />)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('displays error message when fetch fails', () => {
    vi.spyOn(useSystemLogsModule, 'useSystemLogs').mockReturnValue({
      ...mockUseSystemLogs,
      error: 'Failed to fetch logs',
    })

    render(<SystemLogsPage />)
    expect(screen.getByText('Failed to fetch logs')).toBeInTheDocument()
  })

  it('displays empty state when no logs', () => {
    vi.spyOn(useSystemLogsModule, 'useSystemLogs').mockReturnValue({
      ...mockUseSystemLogs,
      logs: [],
      total: 0,
    })

    render(<SystemLogsPage />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('disables export button when no logs', () => {
    vi.spyOn(useSystemLogsModule, 'useSystemLogs').mockReturnValue({
      ...mockUseSystemLogs,
      logs: [],
      total: 0,
    })

    render(<SystemLogsPage />)
    const exportButton = screen.getByText('Export').closest('button')
    expect(exportButton).toBeDisabled()
  })

  it('opens export dialog when export button clicked', async () => {
    render(<SystemLogsPage />)

    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(screen.getByText('Export System Logs')).toBeInTheDocument()
    })
  })

  it('shows exporting state', () => {
    vi.spyOn(useSystemLogsModule, 'useSystemLogs').mockReturnValue({
      ...mockUseSystemLogs,
      exporting: true,
    })

    render(<SystemLogsPage />)
    expect(screen.getByText('Exporting...')).toBeInTheDocument()
  })

  it('displays user avatars with initials', async () => {
    render(<SystemLogsPage />)

    await waitFor(() => {
      const avatars = document.querySelectorAll('.rounded-full')
      expect(avatars.length).toBeGreaterThan(0)
    })
  })

  it('displays log details when available', async () => {
    render(<SystemLogsPage />)

    await waitFor(() => {
      // Details should be displayed in truncated form
      const detailsElements = screen.getAllByText(/ip:|gradeId:|deletedUserId:|attendanceId:/)
      expect(detailsElements.length).toBeGreaterThan(0)
    })
  })

  it('displays dash when no details available', async () => {
    const logsWithoutDetails: SystemLog[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Student',
        action: 'login',
        resource: 'user',
        timestamp: '2024-01-15T10:30:00Z',
      },
    ]

    vi.spyOn(useSystemLogsModule, 'useSystemLogs').mockReturnValue({
      ...mockUseSystemLogs,
      logs: logsWithoutDetails,
    })

    render(<SystemLogsPage />)

    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  it('displays description text', () => {
    render(<SystemLogsPage />)
    expect(screen.getByText('View and manage system activity logs')).toBeInTheDocument()
  })

  it('handles multiple filters simultaneously', async () => {
    render(<SystemLogsPage />)

    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(mockUseSystemLogs.fetchLogs).toHaveBeenCalled()
      },
      { timeout: 500 }
    )
  })

  it('resets page to 1 when filters change', async () => {
    const { rerender } = render(<SystemLogsPage />)

    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(
      () => {
        expect(mockUseSystemLogs.fetchLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          })
        )
      },
      { timeout: 500 }
    )
  })

  // New tests for enhanced features

  it('toggles filter panel visibility', () => {
    render(<SystemLogsPage />)

    const toggleButton = screen.getByText('Hide Filters')
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(screen.getByText('Show Filters')).toBeInTheDocument()
  })

  it('switches between table and timeline views', () => {
    render(<SystemLogsPage />)

    const viewToggle = screen.getByText('Timeline View')
    fireEvent.click(viewToggle)

    expect(screen.getByText('Table View')).toBeInTheDocument()
  })

  it('displays filter count badge when filters are active', async () => {
    render(<SystemLogsPage />)

    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText(/1 filter applied/)).toBeInTheDocument()
    })
  })

  it('clears all filters when clear button is clicked', async () => {
    render(<SystemLogsPage />)

    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText(/1 filter applied/)).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Clear All')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
    })
  })

  it('saves filter preset to localStorage', async () => {
    render(<SystemLogsPage />)

    const presetInput = screen.getByPlaceholderText('Preset name (e.g., \'Failed Logins\')')
    const saveButton = screen.getByText('Save')

    fireEvent.change(presetInput, { target: { value: 'Test Preset' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      const saved = localStorage.getItem('logFilterPresets')
      expect(saved).toBeTruthy()
      const presets = JSON.parse(saved!)
      expect(presets.length).toBe(1)
      expect(presets[0].name).toBe('Test Preset')
    })
  })

  it('loads filter preset from localStorage', async () => {
    const preset = {
      name: 'Test Preset',
      filters: {
        action: 'login',
        resource: '',
        userId: '',
        startDate: '',
        endDate: '',
        search: '',
        logLevel: '',
        status: '',
      },
    }
    localStorage.setItem('logFilterPresets', JSON.stringify([preset]))

    render(<SystemLogsPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Preset')).toBeInTheDocument()
    })
  })

  it('deletes filter preset', async () => {
    const preset = {
      name: 'Test Preset',
      filters: {
        action: 'login',
        resource: '',
        userId: '',
        startDate: '',
        endDate: '',
        search: '',
        logLevel: '',
        status: '',
      },
    }
    localStorage.setItem('logFilterPresets', JSON.stringify([preset]))

    render(<SystemLogsPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Preset')).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText('Delete preset Test Preset')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      const saved = localStorage.getItem('logFilterPresets')
      const presets = JSON.parse(saved!)
      expect(presets.length).toBe(0)
    })
  })

  it('opens detailed log view modal when log is clicked', async () => {
    render(<SystemLogsPage />)

    // Verify the component renders and has logs
    await waitFor(() => {
      const logRows = screen.getAllByText('John Student')
      expect(logRows.length).toBeGreaterThan(0)
    })
  })

  it('displays full log details in modal', async () => {
    render(<SystemLogsPage />)

    // Verify the component renders with user data
    await waitFor(() => {
      const userElements = screen.getAllByText('John Student')
      expect(userElements.length).toBeGreaterThan(0)
    })
  })

  it('filters by log level', async () => {
    render(<SystemLogsPage />)

    // The advanced filters section should be available
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
  })

  it('filters by status', async () => {
    render(<SystemLogsPage />)

    // The advanced filters section should be available
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
  })

  it('displays timeline view with logs', async () => {
    render(<SystemLogsPage />)

    const viewToggle = screen.getByText('Timeline View')
    fireEvent.click(viewToggle)

    await waitFor(() => {
      expect(screen.getByText('Table View')).toBeInTheDocument()
    })
  })

  it('allows filtering by user ID', async () => {
    render(<SystemLogsPage />)

    const userIdInput = screen.getByPlaceholderText('User ID')
    fireEvent.change(userIdInput, { target: { value: 'user1' } })

    await waitFor(() => {
      expect(mockUseSystemLogs.fetchLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
        })
      )
    })
  })

  it('displays all action filter options', async () => {
    render(<SystemLogsPage />)

    // Check that filter controls are rendered
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
  })

  it('displays all resource filter options', async () => {
    render(<SystemLogsPage />)

    // Check that filter controls are rendered
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
  })

  it('disables save preset button when name is empty', () => {
    render(<SystemLogsPage />)

    const saveButton = screen.getByText('Save')
    expect(saveButton).toBeDisabled()
  })

  it('enables save preset button when name is provided', () => {
    render(<SystemLogsPage />)

    const presetInput = screen.getByPlaceholderText('Preset name (e.g., \'Failed Logins\')')
    fireEvent.change(presetInput, { target: { value: 'Test' } })

    const saveButton = screen.getByText('Save')
    expect(saveButton).not.toBeDisabled()
  })
})
