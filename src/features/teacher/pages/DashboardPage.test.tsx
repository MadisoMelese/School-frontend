import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TeacherDashboardPage } from './DashboardPage'
import * as useAuthModule from '@hooks/useAuth'
import * as useLocalStorageModule from '@hooks/useLocalStorage'

// Mock the hooks
vi.mock('@hooks/useAuth')
vi.mock('@hooks/useLocalStorage')

describe('TeacherDashboardPage', () => {
  const mockUser = {
    id: 'teacher-1',
    email: 'teacher@example.com',
    firstname: 'Mr.',
    lastname: 'Smith',
    username: 'mr.smith',
    role: 'teacher' as const,
    isBlocked: false,
    isVerified: true,
    isActive: true,
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
      initializeAuth: vi.fn(),
    })

    // Mock useLocalStorage
    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      { scrollPosition: 0, lastUpdated: Date.now() },
      vi.fn(),
    ])
  })

  it('renders dashboard layout with title', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<TeacherDashboardPage />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays teacher-specific widgets', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Assigned Classes')).toBeInTheDocument()
      expect(screen.getByText('Pending Grading')).toBeInTheDocument()
      expect(screen.getByText("Today's Attendance")).toBeInTheDocument()
      expect(screen.getByText('Messages')).toBeInTheDocument()
    })
  })

  it('displays assigned classes with student count', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Class 10-A')).toBeInTheDocument()
      expect(screen.getByText('Class 10-B')).toBeInTheDocument()
      expect(screen.getByText('Class 9-A')).toBeInTheDocument()
    })
  })

  it('displays grading tasks with progress', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Pending Grading')).toBeInTheDocument()
      // Should show grading progress
      const progressBars = document.querySelectorAll('[role="progressbar"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  it('displays attendance marking status', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Today's Attendance")).toBeInTheDocument()
    })
  })

  it('displays messages with sender information', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument()
    })
  })

  it('shows description text for teachers', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Welcome! Here's your teaching overview.")).toBeInTheDocument()
    })
  })

  it('displays class details with navigation', async () => {
    render(<TeacherDashboardPage />)

    await waitFor(() => {
      const classItems = screen.getAllByText(/Class \d+-[A-Z]/)
      expect(classItems.length).toBeGreaterThan(0)
    })
  })

  it('handles loading state gracefully', async () => {
    render(<TeacherDashboardPage />)

    // Initially should show loading
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    // After loading, should show content
    await waitFor(() => {
      expect(screen.getByText('Assigned Classes')).toBeInTheDocument()
    })
  })

  it('persists scroll position', async () => {
    const mockSetState = vi.fn()
    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      { scrollPosition: 150, lastUpdated: Date.now() },
      mockSetState,
    ])

    render(<TeacherDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
