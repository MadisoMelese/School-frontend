import { apiClient } from '../api/client'
import type { User, UserRole, UserStatus } from 'api.types'

export interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

export interface CreateUserRequest {
  email: string
  name: string
  role: UserRole
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
}

export interface UserFilters {
  role?: UserRole
  status?: UserStatus
  search?: string
  page?: number
  limit?: number
}

/**
 * Admin User Management Service
 * Handles all user management operations for admins
 */

export const userService = {
  /**
   * Get all users with optional filtering
   */
  async getUsers(filters?: UserFilters) {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get<UserListResponse>('/users', { params })
    return response.data
  },

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string) {
    const response = await apiClient.get<{ user: User }>(`/users/${userId}`)
    return response.data.user
  },

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest) {
    const response = await apiClient.post<{ user: User }>('/users', data)
    return response.data.user
  },

  /**
   * Update a user
   */
  async updateUser(userId: string, data: UpdateUserRequest) {
    const response = await apiClient.put<{ user: User }>(`/users/${userId}`, data)
    return response.data.user
  },

  /**
   * Change user role
   */
  async changeUserRole(userId: string, role: UserRole) {
    const response = await apiClient.patch<{ user: User }>(`/users/${userId}/role`, {
      role,
    })
    return response.data.user
  },

  /**
   * Block a user
   */
  async blockUser(userId: string) {
    const response = await apiClient.patch<{ user: User }>(`/users/${userId}/block`, {})
    return response.data.user
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string) {
    const response = await apiClient.patch<{ user: User }>(`/users/${userId}/unblock`, {})
    return response.data.user
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string) {
    await apiClient.delete(`/users/${userId}`)
  },
}
