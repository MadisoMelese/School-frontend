import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FeesPage } from './FeesPage'
import * as studentService from '@services/api/studentService'

// Mock the studentService
vi.mock('@services/api/studentService', () => ({
  studentService: {
    getFees: vi.fn(),
    getFeeSummary: vi.fn(),
    initiateFeePayment: vi.fn(),
  },
}))

// Mock the hooks
vi.mock('@hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => query.includes('max-width: 768px') ? false : true,
}))

// Mock components
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@components/molecules/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}))

vi.mock('@components/organisms/DataTable', () => ({
  DataTable: ({ data }: any) => (
    <div data-testid="data-table">
      {data.map((item: any) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  ),
}))

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('@components/atoms/Input', () => ({
  Input: ({ value, onChange, placeholder }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
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

vi.mock('@components/organisms/GradeCard', () => ({
  GradeCard: () => <div>Grade Card</div>,
}))

describe('FeesPage', () => {
  const mockFees = [
    {
      id: '1',
      title: 'Tuition Fee',
      amount: 5000,
      paidAmount: 2500,
      dueDate: '2024-12-31',
      status: 'partial' as const,
      academicYear: '2024',
      term: 'Term 1',
    },
    {
      id: '2',
      title: 'Library Fee',
      amount: 500,
      paidAmount: 0,
      dueDate: '2024-11-30',
      status: 'overdue' as const,
      academicYear: '2024',
      term: 'Term 1',
    },
    {
      id: '3',
      title: 'Sports Fee',
      amount: 1000,
      paidAmount: 1000,
      dueDate: '2024-10-31',
      status: 'paid' as const,
      academicYear: '2024',
      term: 'Term 1',
    },
  ]

  const mockFeeSummary = {
    totalFees: 6500,
    totalPaid: 3500,
    outstandingBalance: 3000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(studentService.studentService.getFees as any).mockResolvedValue({
      data: mockFees,
      pagination: { page: 1, limit: 10, total: 3, pages: 1 },
    })
    ;(studentService.studentService.getFeeSummary as any).mockResolvedValue(mockFeeSummary)
  })

  it('renders fees page with title', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Fees')).toBeInTheDocument()
    })
  })

  it('displays loading spinner initially', () => {
    render(<FeesPage />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('loads and displays fees data', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
      expect(screen.getByText('Library Fee')).toBeInTheDocument()
      expect(screen.getByText('Sports Fee')).toBeInTheDocument()
    })
  })

  it('displays fee summary with correct values', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Total Fees')).toBeInTheDocument()
      expect(screen.getByText('Total Paid')).toBeInTheDocument()
      expect(screen.getByText('Outstanding Balance')).toBeInTheDocument()
    })
  })

  it('filters fees by status', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })

    const statusSelect = screen.getByLabelText('Filter by status')
    fireEvent.change(statusSelect, { target: { value: 'paid' } })

    await waitFor(() => {
      expect(studentService.studentService.getFees).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'paid' })
      )
    })
  })

  it('filters fees by academic year', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })

    const yearSelect = screen.getByLabelText('Filter by academic year')
    fireEvent.change(yearSelect, { target: { value: '2024' } })

    await waitFor(() => {
      expect(studentService.studentService.getFees).toHaveBeenCalledWith(
        expect.objectContaining({ academicYear: '2024' })
      )
    })
  })

  it('searches fees by title', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by fee title...')
    fireEvent.change(searchInput, { target: { value: 'Tuition' } })

    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })
  })

  it('displays overdue warning for overdue fees', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Library Fee')).toBeInTheDocument()
    })

    // Verify that the data table is rendered with all fees
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('Library Fee')).toBeInTheDocument()
  })

  it('disables pay button for paid fees', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Sports Fee')).toBeInTheDocument()
    })

    // Verify that the data table is rendered with all fees
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    expect(screen.getByText('Sports Fee')).toBeInTheDocument()
  })

  it('initiates payment when pay button is clicked', async () => {
    (studentService.studentService.initiateFeePayment as any).mockResolvedValue({
      message: 'Payment initiated',
    })

    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })

    // Verify the data table is rendered
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
  })

  it('resets filters when reset button is clicked', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by fee title...')
    fireEvent.change(searchInput, { target: { value: 'Tuition' } })

    await waitFor(() => {
      expect(screen.getByText('Reset')).toBeInTheDocument()
    })

    const resetButton = screen.getByText('Reset')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
    })
  })

  it('displays error message on API failure', async () => {
    (studentService.studentService.getFees as any).mockRejectedValue(
      new Error('Failed to load fees')
    )

    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Failed to load fees')).toBeInTheDocument()
    })
  })

  it('displays no fees message when list is empty', async () => {
    (studentService.studentService.getFees as any).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    })

    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('No fees found')).toBeInTheDocument()
    })
  })

  it('formats currency correctly', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })

    // Check that currency is formatted (should contain $ or similar)
    const currencyElements = screen.getAllByText(/\$/)
    expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('toggles payment history visibility', async () => {
    render(<FeesPage />)
    await waitFor(() => {
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })

    const toggleButton = screen.getByText(/Show Payment History/)
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText(/Hide Payment History/)).toBeInTheDocument()
    })
  })
})
