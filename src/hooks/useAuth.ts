import { useAuthStore } from '@/store/authStore';

/**
 * useAuth Hook
 * Provides access to authentication state and actions
 */
export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshTokenValue,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshTokenAction,
    setUser,
    setError,
  } = useAuthStore();

  return {
    user,
    accessToken,
    refreshToken: refreshTokenValue,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshTokenAction,
    setUser,
    setError,
  };
};

export default useAuth;
