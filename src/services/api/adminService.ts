import { apiClient } from './client';
import {
  User,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  BlockUserRequest,
  BlockUserResponse,
  UnblockUserResponse,
  DeleteUserResponse,
  SchoolSettings,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  SystemLog,
  PaginatedResponse,
} from '@/types/api.types';

/**
 * Admin Service
 * Handles admin-specific API calls for user management, settings, reports
 */

export const adminService = {
  /**
   * Get all users with filtering
   */
  getUsers: async (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', {
      params,
    });
    return response.data;
  },

  /**
   * Get user details
   */
  getUserDetails: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>('/admin/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (userId: string, data: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await apiClient.put<UpdateUserResponse>(`/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Block user
   */
  blockUser: async (userId: string, data?: BlockUserRequest): Promise<BlockUserResponse> => {
    const response = await apiClient.post<BlockUserResponse>(`/admin/users/${userId}/block`, data);
    return response.data;
  },

  /**
   * Unblock user
   */
  unblockUser: async (userId: string): Promise<UnblockUserResponse> => {
    const response = await apiClient.post<UnblockUserResponse>(
      `/admin/users/${userId}/unblock`,
      {}
    );
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<DeleteUserResponse> => {
    const response = await apiClient.delete<DeleteUserResponse>(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Get system settings
   */
  getSettings: async (): Promise<SchoolSettings> => {
    const response = await apiClient.get<SchoolSettings>('/admin/settings');
    return response.data;
  },

  /**
   * Update system settings
   */
  updateSettings: async (data: UpdateSettingsRequest): Promise<UpdateSettingsResponse> => {
    const response = await apiClient.put<UpdateSettingsResponse>('/admin/settings', data);
    return response.data;
  },

  /**
   * Get system logs
   */
  getSystemLogs: async (params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SystemLog>> => {
    const response = await apiClient.get<PaginatedResponse<SystemLog>>('/admin/logs', {
      params,
    });
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    recentActivity: Array<{
      userId: string;
      userName: string;
      action: string;
      timestamp: string;
    }>;
  }> => {
    const response = await apiClient.get<{
      totalUsers: number;
      activeUsers: number;
      totalStudents: number;
      totalTeachers: number;
      totalParents: number;
      recentActivity: Array<{
        userId: string;
        userName: string;
        action: string;
        timestamp: string;
      }>;
    }>('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Export data as CSV
   */
  exportData: async (params: {
    resource: 'users' | 'grades' | 'attendance' | 'fees';
    format: 'csv' | 'pdf';
    filters?: Record<string, unknown>;
  }): Promise<Blob> => {
    const response = await apiClient.get('/admin/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get system health metrics
   */
  getSystemHealth: async (): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastChecked: string;
  }> => {
    const response = await apiClient.get<{
      status: 'healthy' | 'degraded' | 'down';
      uptime: number;
      responseTime: number;
      errorRate: number;
      lastChecked: string;
    }>('/admin/health');
    return response.data;
  },
};

export default adminService;
