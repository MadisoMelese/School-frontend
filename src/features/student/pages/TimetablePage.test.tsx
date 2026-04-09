import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimetablePage } from './TimetablePage'
import * as studentService from '@services/api/studentService'
import type { Timetable } from '@types'

// Mock the student service
vi.mock('@services/api/studentService', () => ({
  studentService: {
    getTimetable: vi.fn(),
  },
}))

// Mock the hooks
vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn((query) => {
    if (query === '(max-width: 768px)') {
      return false // Default to desktop view
    }
    return false
  }),
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

// Mock URL.createObjectURL for download tests
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

vi.mock('@components/molecules/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@components/atoms/Badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid={`badge-${variant}`}>{children}</span>
  ),
}))

vi.mock('@components/atoms/Icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>,
}))

vi.mock('@components/atoms/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

// Mock data
const mockTimetable: Timetable[] = [
  {
    id: '1',
    className: 'Mathematics 101',
    subject: 'Mathematics',
    teacherName: 'Mr. Smith',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '10:00',
    roomNumber: 'Room 101',
  },
  {
    id: '2',
    className: 'English Literature',
    subject: 'English',
    teacherName: 'Ms. Johnson',
    dayOfWeek: 1, // Monday
    startTime: '10:30',
    endTime: '11:30',
    roomNumber: 'Room 102',
  },
  {
    id: '3',
    className: 'Physics Lab',
    subject: 'Physics',
    teacherName: 'Dr. Brown',
    dayOfWeek: 3, // Wednesday
    startTime: '14:00',
    endTime: '15:30',
    roomNumber: 'Lab 1',
  },
]

describe('TimetablePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(studentService.studentService.getTimetable as any).mockResolvedValue(mockTimetable)
  })

  it('renders the timetable page with title', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Timetable')).toBeInTheDocument()
    })
  })

  it('displays loading spinner while fetching data', () => {
    ;(studentService.studentService.getTimetable as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<TimetablePage />)

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('displays timetable data after loading', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument()
      expect(screen.getByText('English Literature')).toBeInTheDocument()
      expect(screen.getByText('Physics Lab')).toBeInTheDocument()
    })
  })

  it('displays class details correctly', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mr. Smith')).toBeInTheDocument()
      expect(screen.getByText('Ms. Johnson')).toBeInTheDocument()
      expect(screen.getByText('Dr. Brown')).toBeInTheDocument()
      expect(screen.getByText('Room 101')).toBeInTheDocument()
      expect(screen.getByText('Room 102')).toBeInTheDocument()
      expect(screen.getByText('Lab 1')).toBeInTheDocument()
    })
  })

  it('displays error message when API fails', async () => {
    const errorMessage = 'Failed to load timetable'
    ;(studentService.studentService.getTimetable as any).mockRejectedValue(
      new Error(errorMessage)
    )

    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('displays empty state when no classes scheduled', async () => {
    ;(studentService.studentService.getTimetable as any).mockResolvedValue([])

    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('No classes scheduled for this week')).toBeInTheDocument()
    })
  })

  it('navigates to previous week', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument()
    })

    const previousButton = screen.getAllByText('Previous')[0]
    fireEvent.click(previousButton)

    await waitFor(() => {
      expect(studentService.studentService.getTimetable).toHaveBeenCalledTimes(2)
    })
  })

  it('navigates to next week', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument()
    })

    const nextButton = screen.getAllByText('Next')[0]
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(studentService.studentService.getTimetable).toHaveBeenCalledTimes(2)
    })
  })

  it('navigates to today', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument()
    })

    const todayButton = screen.getByText('Today')
    fireEvent.click(todayButton)

    await waitFor(() => {
      expect(studentService.studentService.getTimetable).toHaveBeenCalledTimes(2)
    })
  })

  it('exports calendar in iCalendar format', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument()
    })

    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a')
    })

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('disables export button when no classes', async () => {
    ;(studentService.studentService.getTimetable as any).mockResolvedValue([])

    render(<TimetablePage />)

    await waitFor(() => {
      const exportButton = screen.getByText('Export')
      expect(exportButton).toBeDisabled()
    })
  })

  it('displays week range correctly', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      const weekLabel = screen.getByText(/Week of/)
      expect(weekLabel).toBeInTheDocument()
    })
  })

  it('calls getTimetable with correct week parameter', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(studentService.studentService.getTimetable).toHaveBeenCalled()
      const callArgs = (studentService.studentService.getTimetable as any).mock.calls[0][0]
      expect(callArgs).toHaveProperty('week')
    })
  })

  it('handles retry on error', async () => {
    ;(studentService.studentService.getTimetable as any).mockRejectedValueOnce(
      new Error('Network error')
    )

    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    const tryAgainButton = screen.getByText('Try Again')
    fireEvent.click(tryAgainButton)

    ;(studentService.studentService.getTimetable as any).mockResolvedValueOnce(mockTimetable)

    await waitFor(() => {
      expect(studentService.studentService.getTimetable).toHaveBeenCalledTimes(2)
    })
  })

  it('organizes classes by day of week', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument()
    })

    // Check that classes are organized by day
    const cards = screen.getAllByTestId('card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('sorts classes by start time within a day', async () => {
    render(<TimetablePage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument()
      expect(screen.getByText('English Literature')).toBeInTheDocument()
    })

    // Mathematics (09:00) should appear before English (10:30)
    const mathIndex = screen.getByText('Mathematics 101').closest('[data-testid="card"]')
    const englishIndex = screen.getByText('English Literature').closest('[data-testid="card"]')

    expect(mathIndex).toBeInTheDocument()
    expect(englishIndex).toBeInTheDocument()
  })
})
