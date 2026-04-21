import { apiClient } from './client';
import { PaginatedResponse } from '@/types/api.types';

/**
 * User Service
 * Handles user-related API calls
 */

export interface User {
  _id: string;
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  location?: {
    city?: string;
    country?: string;
  };
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  /**
   * Get all users with optional filters
   */
  getUsers: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', {
      params,
    });
    return response.data;
  },

  /**
   * Get all users for dropdown (no pagination)
   */
  getAllUsers: async (params?: {
    role?: string;
    search?: string;
  }): Promise<User[]> => {
    const response = await apiClient.get<{ data: { users: User[] } }>('/users', {
      params: {
        ...params,
        limit: 1000,
      },
    });
    return Array.isArray(response.data.data?.users) ? response.data.data.users : [];
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },
};

export default userService;
