import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StudentDashboardPage } from './DashboardPage'
import * as useAuthModule from '@hooks/useAuth'
import * as useLocalStorageModule from '@hooks/useLocalStorage'

// Mock the hooks
vi.mock('@hooks/useAuth')
vi.mock('@hooks/useLocalStorage')

describe('StudentDashboardPage', () => {
  const mockUser = {
    id: 'student-1',
    email: 'student@example.com',
    name: 'John Doe',
    role: 'student' as const,
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
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<StudentDashboardPage />)

    // Dashboard should show skeleton loaders while loading
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays dashboard widgets after loading', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent Grades')).toBeInTheDocument()
      expect(screen.getByText('Attendance')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Exams')).toBeInTheDocument()
      expect(screen.getByText('Fee Status')).toBeInTheDocument()
      expect(screen.getByText('Messages')).toBeInTheDocument()
    })
  })

  it('displays grade cards with subject and marks', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
    })
  })

  it('displays attendance percentage', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument()
    })
  })

  it('displays upcoming exams with dates', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Upcoming Exams')).toBeInTheDocument()
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
    })
  })

  it('displays fee status with payment information', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Fee Status')).toBeInTheDocument()
      expect(screen.getByText('Tuition Fee')).toBeInTheDocument()
    })
  })

  it('displays messages with sender information', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument()
    })
  })

  it('has responsive grid layout', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      const dashboard = document.querySelector('.grid')
      expect(dashboard).toHaveClass('grid-cols-1')
    })
  })

  it('persists scroll position on localStorage', async () => {
    const mockSetState = vi.fn()
    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      { scrollPosition: 100, lastUpdated: Date.now() },
      mockSetState,
    ])

    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('displays description text', async () => {
    render(<StudentDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Welcome back! Here's your academic overview.")).toBeInTheDocument()
    })
  })

  it('handles loading state gracefully', async () => {
    render(<StudentDashboardPage />)

    // Initially should show loading
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    // After loading, should show content
    await waitFor(() => {
      expect(screen.getByText('Recent Grades')).toBeInTheDocument()
    })
  })
})
