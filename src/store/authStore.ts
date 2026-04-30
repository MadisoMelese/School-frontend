import { create } from 'zustand';
import { User } from '@/types/api.types';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '@/services/api/tokenManager';
import authService from '@/services/api/authService';
import { getUserFriendlyErrorMessage } from '@/services/api/errorHandler';

/**
 * Auth Store
 * Manages authentication state, user data, and token management
 * 
 * Security Note: Refresh tokens should be stored in httpOnly cookies by the backend.
 * The frontend should NOT have access to refresh tokens directly.
 * If the backend returns a refresh token in the response body, it's stored in
 * localStorage for compatibility, but this is less secure than httpOnly cookies.
 */

export interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
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
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });

      // Store tokens
      // Note: If backend uses httpOnly cookies for refresh token,
      // response.refreshToken will be undefined/null
      setTokens(
        response.accessToken,
        response.refreshToken, // Will be undefined if using httpOnly cookies
        response.expiresIn,
        response.refreshExpiresIn
      );

      // Update state - only store access token in memory
      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Logout action
  logout: () => {
    clearTokens();
    set({
      user: null,
      accessToken: null,
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
        response.refreshToken, // Will be undefined if using httpOnly cookies
        response.expiresIn,
        response.refreshExpiresIn
      );

      // Update state
      set({
        accessToken: response.accessToken,
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
      // Note: getRefreshToken may return null if using httpOnly cookies
      // We check for accessToken only since refresh is handled by cookies
      const hasRefreshToken = getRefreshToken();

      if (accessToken) {
        set({
          accessToken,
          isAuthenticated: true,
        });

        // Fetch user profile to restore user data
        try {
          const response = await authService.getProfile();
          set({
            user: response.user,
          });
        } catch (error) {
          // If profile fetch fails, try to refresh token first
          // If refresh also fails, logout
          try {
            await get().refreshTokenAction();
            const retryResponse = await authService.getProfile();
            set({ user: retryResponse.user });
          } catch {
            get().logout();
          }
        }
      } else if (hasRefreshToken) {
        // No access token but have refresh token - try to refresh
        try {
          await get().refreshTokenAction();
          const response = await authService.getProfile();
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch {
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
