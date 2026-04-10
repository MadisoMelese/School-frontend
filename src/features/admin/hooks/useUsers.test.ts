import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUsers } from './useUsers'
import type { User } from '../../../types/api.types'

describe('useUsers Hook', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'user1@example.com',
      firstname: 'User',
      lastname: 'One',
      username: 'user.one',
      role: 'student',
      isBlocked: false,
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'user2@example.com',
      firstname: 'User',
      lastname: 'Two',
      username: 'user.two',
      role: 'teacher',
      isBlocked: false,
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useUsers())

    expect(result.current.users).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.page).toBe(1)
    expect(result.current.limit).toBe(10)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
