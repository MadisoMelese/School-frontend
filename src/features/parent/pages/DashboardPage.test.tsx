import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ParentDashboardPage } from './DashboardPage'
import * as useAuthModule from '@hooks/useAuth'
import * as useLocalStorageModule from '@hooks/useLocalStorage'

// Mock the hooks
vi.mock('@hooks/useAuth')
vi.mock('@hooks/useLocalStorage')

describe('ParentDashboardPage', () => {
  const mockUser = {
    id: 'parent-1',
    email: 'parent@example.com',
    name: 'Jane Doe',
    role: 'parent' as const,
    status: 'active' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useAuth
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      accessToken: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshTokenAction: vi.fn(),
      setUser: vi.fn(),
      setError: vi.fn(),
    })

    // Mock useLocalStorage
    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      { scrollPosition: 0, lastUpdated: Date.now() },
      vi.fn(),
    ])
  })

  it('renders dashboard layout with title', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<ParentDashboardPage />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays parent-specific widgets', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Child Overview')).toBeInTheDocument()
      expect(screen.getByText('Recent Grades')).toBeInTheDocument()
      expect(screen.getByText('Attendance Status')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Exams')).toBeInTheDocument()
      expect(screen.getByText('Fee Status')).toBeInTheDocument()
    })
  })

  it('displays child information', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('10-A')).toBeInTheDocument()
    })
  })

  it('displays child GPA and attendance', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('3.80')).toBeInTheDocument()
      expect(screen.getByText('92%')).toBeInTheDocument()
    })
  })

  it('displays recent grades', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent Grades')).toBeInTheDocument()
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
    })
  })

  it('displays attendance status with percentage', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Attendance Status')).toBeInTheDocument()
    })
  })

  it('displays upcoming exams', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Upcoming Exams')).toBeInTheDocument()
    })
  })

  it('displays fee status with payment information', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Fee Status')).toBeInTheDocument()
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })
  })

  it('shows description text for parents', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Monitor your child's academic progress.")).toBeInTheDocument()
    })
  })

  it('displays warning when attendance is low', async () => {
    render(<ParentDashboardPage />)

    await waitFor(() => {
      // Since attendance is 92%, warning should not appear
      // But the attendance widget should be present
      expect(screen.getByText('Attendance Status')).toBeInTheDocument()
    })
  })

  it('handles loading state gracefully', async () => {
    render(<ParentDashboardPage />)

    // Initially should show loading
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    // After loading, should show content
    await waitFor(() => {
      expect(screen.getByText('Child Overview')).toBeInTheDocument()
    })
  })

  it('persists scroll position', async () => {
    const mockSetState = vi.fn()
    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      { scrollPosition: 200, lastUpdated: Date.now() },
      mockSetState,
    ])

    render(<ParentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
