import { create } from 'zustand';
import { User } from '@/types/api.types';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '@/services/api/tokenManager';
import authService from '@/services/api/authService';

/**
 * Auth Store
 * Manages authentication state, user data, and token management
 */

export interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshTokenValue: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshTokenAction: () => Promise<void>;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  refreshTokenValue: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });

      // Store tokens
      setTokens(
        response.accessToken,
        response.refreshToken || 'cookie-based', // Use placeholder if refresh token is in httpOnly cookie
        response.expiresIn,
        response.refreshExpiresIn
      );

      // Update state
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshTokenValue: response.refreshToken || 'cookie-based',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  // Logout action
  logout: () => {
    clearTokens();
    set({
      user: null,
      accessToken: null,
      refreshTokenValue: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Refresh token action
  refreshTokenAction: async () => {
    try {
      const response = await authService.refreshToken();

      // Store new tokens
      setTokens(
        response.accessToken,
        response.refreshToken,
        response.expiresIn,
        response.refreshExpiresIn
      );

      // Update state
      set({
        accessToken: response.accessToken,
        refreshTokenValue: response.refreshToken,
        error: null,
      });
    } catch (error) {
      // If refresh fails, logout user
      get().logout();
      throw error;
    }
  },

  // Set user action
  setUser: (user: User) => {
    set({ user });
  },

  // Set error action
  setError: (error: string | null) => {
    set({ error });
  },

  // Initialize auth from stored tokens
  initializeAuth: async () => {
    try {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (accessToken && refreshToken) {
        set({
          accessToken,
          refreshTokenValue: refreshToken,
          isAuthenticated: true,
        });

        // Fetch user profile to restore user data
        try {
          const response = await authService.getProfile();
          set({
            user: response.user,
          });
        } catch (error) {
          // If profile fetch fails, logout
          get().logout();
        }
      } else {
        clearTokens();
        set({
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearTokens();
      set({
        isAuthenticated: false,
      });
    }
  },
}));

export default useAuthStore;
