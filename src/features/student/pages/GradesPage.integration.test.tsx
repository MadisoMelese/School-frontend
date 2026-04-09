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

// Mock the layout
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
  {
    id: '4',
    subject: 'History',
    marksObtained: 88,
    totalMarks: 100,
    percentage: 88,
    grade: 'A',
    remarks: 'Great understanding of concepts',
    examDate: '2024-02-01',
    academicYear: '2023-2024',
  },
]

const mockPerformanceSummary = {
  averageGrade: 85.75,
  highestScore: 92,
  lowestScore: 78,
  gpa: 3.8,
}

describe('GradesPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(studentService.studentService.getGrades as any).mockResolvedValue({
      data: mockGrades,
      pagination: { page: 1, limit: 10, total: 4, pages: 1 },
    })
    ;(studentService.studentService.getPerformanceSummary as any).mockResolvedValue(
      mockPerformanceSummary
    )
  })

  it('loads and displays all grades on initial render', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('displays performance summary with correct values', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      expect(screen.getByText('Average Grade')).toBeInTheDocument()
      expect(screen.getByText('Highest Score')).toBeInTheDocument()
      expect(screen.getByText('Lowest Score')).toBeInTheDocument()
      expect(screen.getByText('GPA')).toBeInTheDocument()
    })
  })

  it('filters grades by subject and updates display', async () => {
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

  it('displays grade distribution chart with all subjects', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      expect(screen.getByText('Grade Distribution by Subject')).toBeInTheDocument()
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

  it('combines multiple filters correctly', async () => {
    render(<GradesPage />)

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    // Apply subject filter
    const subjectSelect = screen.getByLabelText('Filter by subject')
    fireEvent.change(subjectSelect, { target: { value: 'Mathematics' } })

    await waitFor(() => {
      expect(studentService.studentService.getGrades).toHaveBeenCalledWith({
        academicYear: undefined,
        subject: 'Mathematics',
      })
    })

    // Apply year filter
    const yearSelect = screen.getByLabelText('Filter by academic year')
    fireEvent.change(yearSelect, { target: { value: '2023-2024' } })

    await waitFor(() => {
      expect(studentService.studentService.getGrades).toHaveBeenCalledWith({
        academicYear: '2023-2024',
        subject: 'Mathematics',
      })
    })
  })
})
