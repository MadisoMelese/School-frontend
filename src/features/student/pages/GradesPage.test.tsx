import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GradesPage } from './GradesPage'
import * as studentService from '@services/api/studentService'
import type { Grade } from '@types'

// Mock the service
vi.mock('@services/api/studentService')

// Mock the hooks
vi.mock('@hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => {
    if (query.includes('max-width: 768px')) return false // Desktop by default
    return false
  },
}))

// Mock the layout and components
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

const mockGrades: Grade[] = [
  {
    id: '1',
    subject: 'Mathematics',
    marksObtained: 85,
    totalMarks: 100,
    percentage: 85,
    grade: 'A',
    remarks: 'Good performance',
    examDate: '2024-01-15',
    academicYear: '2023-2024',
  },
  {
    id: '2',
    subject: 'English',
    marksObtained: 78,
    totalMarks: 100,
    percentage: 78,
    grade: 'B+',
    remarks: 'Needs improvement in writing',
    examDate: '2024-01-16',
    academicYear: '2023-2024',
  },
  {
    id: '3',
    subject: 'Science',
    marksObtained: 92,
    totalMarks: 100,
    percentage: 92,
    grade: 'A+',
    remarks: 'Excellent work',
    examDate: '2024-01-17',
    academicYear: '2023-2024',
  },
]

const mockPerformanceSummary = {
  averageGrade: 85,
  highestScore: 92,
  lowestScore: 78,
  gpa: 3.8,
}

describe('GradesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(studentService.studentService.getGrades as any).mockResolvedValue({
      data: mockGrades,
      pagination: { page: 1, limit: 10, total: 3, pages: 1 },
    })
    ;(studentService.studentService.getPerformanceSummary as any).mockResolvedValue(
      mockPerformanceSummary
    )
  })

  it('renders the grades page with title', async () => {
    render(<GradesPage />)
    expect(screen.getByText('Grades')).toBeInTheDocument()
  })

  it('loads and displays grades', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('displays performance summary', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      expect(screen.getByText('Average Grade')).toBeInTheDocument()
      expect(screen.getByText('Highest Score')).toBeInTheDocument()
      expect(screen.getByText('Lowest Score')).toBeInTheDocument()
      expect(screen.getByText('GPA')).toBeInTheDocument()
    })
  })

  it('displays grade distribution chart', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      expect(screen.getByText('Grade Distribution by Subject')).toBeInTheDocument()
    })
  })

  it('filters grades by academic year', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    const yearSelect = screen.getByLabelText('Filter by academic year')
    fireEvent.change(yearSelect, { target: { value: '2023-2024' } })

    await waitFor(() => {
      expect(studentService.studentService.getGrades).toHaveBeenCalledWith({
        academicYear: '2023-2024',
        subject: undefined,
      })
    })
  })

  it('filters grades by subject', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    const subjectSelect = screen.getByLabelText('Filter by subject')
    fireEvent.change(subjectSelect, { target: { value: 'Mathematics' } })

    await waitFor(() => {
      expect(studentService.studentService.getGrades).toHaveBeenCalledWith({
        academicYear: undefined,
        subject: 'Mathematics',
      })
    })
  })

  it('displays error message on load failure', async () => {
    const errorMessage = 'Failed to load grades'
    ;(studentService.studentService.getGrades as any).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    render(<GradesPage />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('displays no grades message when list is empty', async () => {
    ;(studentService.studentService.getGrades as any).mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    })

    render(<GradesPage />)

    await waitFor(() => {
      expect(screen.getByText('No grades found')).toBeInTheDocument()
    })
  })

  it('displays filter section with all filter options', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Search grades')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by academic year')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by subject')).toBeInTheDocument()
  })

  it('displays table with correct structure', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      const headers = within(table).getAllByRole('columnheader')
      expect(headers.length).toBeGreaterThan(0)
    })
  })
})
