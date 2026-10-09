import { apiClient } from '../api/client';
import type { User, UserRole, UserStatus } from '@/types/api.types';

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateUserRequest {
  email: string;
  firstname: string;
  lastname: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
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
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status === 'active') params.append('isActive', 'true');
    if (filters?.status === 'inactive') {
      params.append('isActive', 'false');
      params.append('isBlocked', 'false');
    }
    if (filters?.status === 'blocked') params.append('isBlocked', 'true');
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<{
      success: boolean;
      data: UserListResponse;
      message: string;
    }>('/admin/users', { params });
    return {
      ...response.data.data,
      limit: filters?.limit ?? 20,
    };
  },

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: { user: User };
      message: string;
    }>(`/users/${userId}`);
    return response.data.data.user;
  },

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest) {
    const response = await apiClient.post<{
      success: boolean;
      data: { user: User };
      message: string;
    }>('/admin/users', {
      email: data.email,
      name: `${data.firstname} ${data.lastname}`.trim(),
      role: data.role,
    });
    return response.data.data.user;
  },

  /**
   * Update a user
   */
  async updateUser(userId: string, data: UpdateUserRequest) {
    const response = await apiClient.put<{
      success: boolean;
      data: { user: User };
      message: string;
    }>(`/users/${userId}`, data);
    return response.data.data.user;
  },

  /**
   * Change user role
   */
  async changeUserRole(userId: string, role: UserRole) {
    const response = await apiClient.put<{
      success: boolean;
      data: { user: User };
      message: string;
    }>(`/admin/users/${userId}`, {
      role,
    });
    return response.data.data.user;
  },

  /**
   * Block a user
   */
  async blockUser(userId: string) {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: User };
      message: string;
    }>(`/users/${userId}/block`, {});
    return response.data.data.user;
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string) {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: User };
      message: string;
    }>(`/users/${userId}/unblock`, {});
    return response.data.data.user;
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string) {
    await apiClient.delete(`/users/${userId}`);
  },
};
