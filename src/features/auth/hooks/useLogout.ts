import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import authService from '@/services/api/authService';

/**
 * useLogout Hook
 * Handles logout functionality with cleanup
 * Features:
 * - Clears auth state
 * - Clears stored tokens
 * - Redirects to login page
 * - Handles errors gracefully
 */

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: clearAuthState } = useAuth();

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if needed (optional)
      // await authService.logout();
    } catch (error) {
      // Log error but continue with logout
      console.error('Logout error:', error);
    } finally {
      try {
        // Clear auth state
        clearAuthState();
      } catch (error) {
        // Log error but continue with navigation
        console.error('Clear auth state error:', error);
      }

      // Redirect to login
      navigate('/login', { replace: true });
    }
  }, [clearAuthState, navigate]);

  return { logout };
};

export default useLogout;
