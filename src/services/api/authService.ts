import { apiClient } from './client';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@/types/api.types';

/**
 * Authentication Service
 * Handles login, logout, token refresh, and password management
 */

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        user: any;
        accessToken: string;
      };
    }>('/sessions', credentials);

    // Transform backend response to match frontend expectations
    const { data } = response.data;
    return {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: '', // Backend stores refresh token in httpOnly cookie
      expiresIn: 3600, // Default 1 hour
      refreshExpiresIn: 604800, // Default 7 days
    };
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/token', {});
    return response.data;
  },

  /**
   * Request password reset link
   */
  requestPasswordReset: async (data: PasswordResetRequest): Promise<PasswordResetResponse> => {
    const response = await apiClient.post<PasswordResetResponse>('/auth/password-reset', data);
    return response.data;
  },

  /**
   * Confirm password reset with token and new password
   */
  confirmPasswordReset: async (
    data: PasswordResetConfirmRequest
  ): Promise<PasswordResetConfirmResponse> => {
    const response = await apiClient.post<PasswordResetConfirmResponse>(
      '/auth/password-reset/confirm',
      data
    );
    return response.data;
  },

  /**
   * Change password for authenticated user
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: any }> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: { user: any };
    }>('/users/me');
    return response.data.data;
  },
};

export default authService;
