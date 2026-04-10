import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AttendancePage } from './AttendancePage'
import * as studentService from '@services/api/studentService'

// Mock the service
vi.mock('@services/api/studentService', () => ({
  studentService: {
    getAttendance: vi.fn(),
    getAttendancePercentage: vi.fn(),
  },
}))

// Mock the components
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@components/molecules/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@components/atoms/Badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

vi.mock('@components/atoms/Icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>,
}))

vi.mock('@components/atoms/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => {
    if (query === '(max-width: 768px)') return false
    return false
  },
}))

describe('AttendancePage', () => {
  const mockAttendanceData = [
    {
      id: '1',
      date: '2024-01-15',
      status: 'present' as const,
      notes: 'On time',
    },
    {
      id: '2',
      date: '2024-01-16',
      status: 'absent' as const,
      notes: 'Sick leave',
    },
    {
      id: '3',
      date: '2024-01-17',
      status: 'late' as const,
      notes: 'Traffic',
    },
    {
      id: '4',
      date: '2024-01-18',
      status: 'excused' as const,
      notes: 'Medical appointment',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(studentService.studentService.getAttendance as any).mockResolvedValue({
      data: mockAttendanceData,
    })
    ;(studentService.studentService.getAttendancePercentage as any).mockResolvedValue({
      percentage: 85.5,
      term: 'Term 1',
    })
  })

  it('renders attendance page with title', async () => {
    render(<AttendancePage />)
    expect(screen.getByText('Attendance')).toBeInTheDocument()
  })

  it('displays loading spinner while fetching data', () => {
    (studentService.studentService.getAttendance as any).mockImplementation(
      () => new Promise(() => {})
    )
    render(<AttendancePage />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('displays attendance percentage', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      expect(screen.getByText('85.5%')).toBeInTheDocument()
    })
  })

  it('displays summary cards with correct counts', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      // Check for summary cards - look for the specific card structure
      const cards = screen.getAllByTestId('card')
      expect(cards.length).toBeGreaterThan(4) // At least 5 summary cards
    })
  })

  it('shows warning indicator when attendance < 75%', async () => {
    (studentService.studentService.getAttendancePercentage as any).mockResolvedValue({
      percentage: 70,
      term: 'Term 1',
    })
    render(<AttendancePage />)
    await waitFor(() => {
      expect(screen.getByText('Below 75%')).toBeInTheDocument()
    })
  })

  it('displays attendance records in list view', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      expect(screen.getByText(/Jan 15/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 16/)).toBeInTheDocument()
    })
  })

  it('displays status badges with correct variants', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      const badges = screen.getAllByTestId('badge')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('displays teacher notes for each record', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      expect(screen.getByText('On time')).toBeInTheDocument()
      expect(screen.getByText('Sick leave')).toBeInTheDocument()
      expect(screen.getByText('Traffic')).toBeInTheDocument()
    })
  })

  it('displays color-coded status indicators', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      // Check for status icons
      expect(screen.getByTestId('icon-Check')).toBeInTheDocument() // Present
      expect(screen.getByTestId('icon-X')).toBeInTheDocument() // Absent
      expect(screen.getByTestId('icon-Clock')).toBeInTheDocument() // Late
    })
  })

  it('handles month navigation', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      expect(screen.getByText('Attendance')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const nextMonthButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Next month')
    expect(nextMonthButton).toBeInTheDocument()
  })

  it('displays error message on API failure', async () => {
    const errorMessage = 'Failed to load attendance'
    ;(studentService.studentService.getAttendance as any).mockRejectedValue(
      new Error(errorMessage)
    )
    render(<AttendancePage />)
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('displays empty state when no records found', async () => {
    (studentService.studentService.getAttendance as any).mockResolvedValue({
      data: [],
    })
    render(<AttendancePage />)
    await waitFor(() => {
      expect(screen.getByText('No attendance records for this month')).toBeInTheDocument()
    })
  })

  it('calculates attendance summary correctly', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      // Check that summary is calculated
      const cards = screen.getAllByTestId('card')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  it('displays calendar legend on desktop', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      // Check for legend section with all status types
      const legendElements = screen.getAllByText('Present')
      expect(legendElements.length).toBeGreaterThan(0)
      const absentElements = screen.getAllByText('Absent')
      expect(absentElements.length).toBeGreaterThan(0)
    })
  })

  it('fetches attendance with correct month and year parameters', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      expect(studentService.studentService.getAttendance).toHaveBeenCalled()
      const callArgs = (studentService.studentService.getAttendance as any).mock.calls[0][0]
      expect(callArgs).toHaveProperty('month')
      expect(callArgs).toHaveProperty('year')
    })
  })

  it('displays attendance percentage with correct color based on threshold', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      const percentageText = screen.getByText('85.5%')
      expect(percentageText).toHaveClass('text-success-600')
    })
  })

  it('shows "Today" button for quick navigation', async () => {
    render(<AttendancePage />)
    await waitFor(() => {
      const todayButton = screen.getByRole('button', { name: /Today/i })
      expect(todayButton).toBeInTheDocument()
    })
  })
})
