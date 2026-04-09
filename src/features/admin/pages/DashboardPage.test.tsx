import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminDashboardPage } from './DashboardPage'
import * as useAuthModule from '@hooks/useAuth'
import * as useLocalStorageModule from '@hooks/useLocalStorage'

// Mock the hooks
vi.mock('@hooks/useAuth')
vi.mock('@hooks/useLocalStorage')

describe('AdminDashboardPage', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
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

  it('renders admin dashboard layout with title', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<AdminDashboardPage />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays admin-specific widgets', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('System Statistics')).toBeInTheDocument()
      expect(screen.getByText('Recent User Activity')).toBeInTheDocument()
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
      expect(screen.getByText('System Health')).toBeInTheDocument()
    })
  })

  it('displays system statistics', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Students')).toBeInTheDocument()
      expect(screen.getByText('Teachers')).toBeInTheDocument()
      expect(screen.getByText('Parents')).toBeInTheDocument()
    })
  })

  it('displays user count statistics', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('1250')).toBeInTheDocument() // Total users
      expect(screen.getByText('850')).toBeInTheDocument() // Students
      expect(screen.getByText('120')).toBeInTheDocument() // Teachers
      expect(screen.getByText('280')).toBeInTheDocument() // Parents
    })
  })

  it('displays recent user activity', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent User Activity')).toBeInTheDocument()
    })
  })

  it('displays pending approvals', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
    })
  })

  it('displays system health metrics', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument()
      expect(screen.getByText('System Uptime')).toBeInTheDocument()
      expect(screen.getByText('Database')).toBeInTheDocument()
      expect(screen.getByText('API Response')).toBeInTheDocument()
    })
  })

  it('displays uptime percentage', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('99.8%')).toBeInTheDocument()
    })
  })

  it('displays API response time', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('145ms')).toBeInTheDocument()
    })
  })

  it('shows description text for admins', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('System overview and administration controls.')).toBeInTheDocument()
    })
  })

  it('handles loading state gracefully', async () => {
    render(<AdminDashboardPage />)

    // Initially should show loading
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    // After loading, should show content
    await waitFor(() => {
      expect(screen.getByText('System Statistics')).toBeInTheDocument()
    })
  })

  it('persists scroll position', async () => {
    const mockSetState = vi.fn()
    vi.spyOn(useLocalStorageModule, 'useLocalStorage').mockReturnValue([
      { scrollPosition: 250, lastUpdated: Date.now() },
      mockSetState,
    ])

    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('displays database status', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('healthy')).toBeInTheDocument()
    })
  })

  it('displays active connections count', async () => {
    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('342')).toBeInTheDocument()
    })
  })
})
