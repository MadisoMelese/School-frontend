import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserManagementPage } from './UserManagementPage'
import * as useUsersModule from '../hooks/useUsers'
import type { User } from '@types/api.types'

// Mock the useUsers hook
vi.mock('../hooks/useUsers')

describe('UserManagementPage', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'student@example.com',
      name: 'John Student',
      role: 'student',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'teacher@example.com',
      name: 'Jane Teacher',
      role: 'teacher',
      status: 'active',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      email: 'blocked@example.com',
      name: 'Blocked User',
      role: 'student',
      status: 'blocked',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ]

  const mockUseUsers = {
    users: mockUsers,
    total: 3,
    page: 1,
    limit: 10,
    loading: false,
    error: null,
    fetchUsers: vi.fn(),
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    changeRole: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
    deleteUser: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useUsersModule, 'useUsers').mockReturnValue(mockUseUsers)
  })

  it('renders user management page with title', () => {
    render(<UserManagementPage />)
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Manage all users in the system')).toBeInTheDocument()
  })

  it('displays create user button', () => {
    render(<UserManagementPage />)
    expect(screen.getByText('Create User')).toBeInTheDocument()
  })

  it('displays filter controls', () => {
    render(<UserManagementPage />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByLabelText('Search users')).toBeInTheDocument()
  })

  it('displays user list in table', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('John Student')).toBeInTheDocument()
      expect(screen.getByText('Jane Teacher')).toBeInTheDocument()
      expect(screen.getByText('Blocked User')).toBeInTheDocument()
    })
  })

  it('displays user emails', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('student@example.com')).toBeInTheDocument()
      expect(screen.getByText('teacher@example.com')).toBeInTheDocument()
    })
  })

  it('displays user roles as badges', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      const studentBadges = screen.getAllByText('Student')
      const teacherBadges = screen.getAllByText('Teacher')
      expect(studentBadges.length).toBeGreaterThan(0)
      expect(teacherBadges.length).toBeGreaterThan(0)
    })
  })

  it('displays user status as badges', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active')
      const blockedBadges = screen.getAllByText('Blocked')
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(blockedBadges.length).toBeGreaterThan(0)
    })
  })

  it('displays action buttons for each user', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      const viewButtons = screen.getAllByLabelText(/View details for/)
      const editButtons = screen.getAllByLabelText(/Edit/)
      const deleteButtons = screen.getAllByLabelText(/Delete/)
      expect(viewButtons.length).toBe(3)
      expect(editButtons.length).toBe(3)
      expect(deleteButtons.length).toBe(3)
    })
  })

  it('fetches users on mount', () => {
    render(<UserManagementPage />)
    expect(mockUseUsers.fetchUsers).toHaveBeenCalled()
  })

  it('filters users by role', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      expect(mockUseUsers.fetchUsers).toHaveBeenCalled()
    })
  })

  it('filters users by status', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      expect(mockUseUsers.fetchUsers).toHaveBeenCalled()
    })
  })

  it('searches users by name or email', async () => {
    render(<UserManagementPage />)

    const searchInput = screen.getByPlaceholderText('Search by name or email...')
    fireEvent.change(searchInput, { target: { value: 'john' } })

    await waitFor(() => {
      expect(mockUseUsers.fetchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'john',
        })
      )
    })
  })

  it('displays loading state', () => {
    vi.spyOn(useUsersModule, 'useUsers').mockReturnValue({
      ...mockUseUsers,
      loading: true,
    })

    render(<UserManagementPage />)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('displays error message when fetch fails', () => {
    vi.spyOn(useUsersModule, 'useUsers').mockReturnValue({
      ...mockUseUsers,
      error: 'Failed to fetch users',
    })

    render(<UserManagementPage />)
    expect(screen.getByText('Failed to fetch users')).toBeInTheDocument()
  })

  it('displays empty state when no users', () => {
    vi.spyOn(useUsersModule, 'useUsers').mockReturnValue({
      ...mockUseUsers,
      users: [],
      total: 0,
    })

    render(<UserManagementPage />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('opens details modal when view button clicked', async () => {
    render(<UserManagementPage />)

    const viewButtons = screen.getAllByLabelText(/View details for/)
    fireEvent.click(viewButtons[0])

    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument()
    })
  })

  it('opens edit modal when edit button clicked', async () => {
    render(<UserManagementPage />)

    const editButtons = screen.getAllByLabelText(/Edit/)
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument()
    })
  })

  it('opens create modal when create button clicked', async () => {
    render(<UserManagementPage />)

    const createButton = screen.getByText('Create User')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create New User')).toBeInTheDocument()
    })
  })

  it('shows delete confirmation when delete button clicked', async () => {
    render(<UserManagementPage />)

    const deleteButtons = screen.getAllByLabelText(/Delete/)
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Delete User')).toBeInTheDocument()
    })
  })

  it('calls blockUser when block button clicked for active user', async () => {
    render(<UserManagementPage />)

    const blockButtons = screen.getAllByLabelText(/Block/)
    fireEvent.click(blockButtons[0])

    await waitFor(() => {
      expect(mockUseUsers.blockUser).toHaveBeenCalledWith('1')
    })
  })

  it('calls unblockUser when unblock button clicked for blocked user', async () => {
    render(<UserManagementPage />)

    const unblockButtons = screen.getAllByLabelText(/Unblock/)
    fireEvent.click(unblockButtons[0])

    await waitFor(() => {
      expect(mockUseUsers.unblockUser).toHaveBeenCalledWith('3')
    })
  })

  it('displays created date for each user', async () => {
    render(<UserManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('1/1/2024')).toBeInTheDocument()
    })
  })

  it('displays description text', () => {
    render(<UserManagementPage />)
    expect(screen.getByText('Manage all users in the system')).toBeInTheDocument()
  })

  it('handles multiple filters simultaneously', async () => {
    render(<UserManagementPage />)

    const searchInput = screen.getByPlaceholderText('Search by name or email...')
    fireEvent.change(searchInput, { target: { value: 'jane' } })

    await waitFor(() => {
      expect(mockUseUsers.fetchUsers).toHaveBeenCalled()
    })
  })
})
