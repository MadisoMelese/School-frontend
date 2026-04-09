import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAccessTokenTimeRemaining, shouldRefreshToken } from '@/services/api/tokenManager';

/**
 * useSessionTimeout Hook
 * Handles automatic token refresh 1 minute before expiry
 * Features:
 * - Monitors token expiry time
 * - Automatically refreshes token 1 minute before expiry
 * - Handles refresh errors gracefully
 * - Cleans up on unmount
 */

const REFRESH_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
const REFRESH_BUFFER = 60 * 1000; // Refresh 1 minute before expiry

export const useSessionTimeout = () => {
  const { refreshTokenAction, isAuthenticated } = useAuth();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback(() => {
    // Clear existing timeouts
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (!isAuthenticated) {
      return;
    }

    const timeRemaining = getAccessTokenTimeRemaining();

    // If token needs refresh now
    if (shouldRefreshToken()) {
      refreshTokenAction?.().catch((error: unknown) => {
        console.error('Token refresh failed:', error);
      });
      return;
    }

    // Schedule refresh for 1 minute before expiry
    const refreshTime = Math.max(0, timeRemaining - REFRESH_BUFFER);

    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTokenAction?.().catch((error: unknown) => {
          console.error('Token refresh failed:', error);
        });
      }, refreshTime);
    }
  }, [isAuthenticated, refreshTokenAction]);

  // Setup periodic check
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up if not authenticated
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      return;
    }

    // Initial schedule
    scheduleTokenRefresh();

    // Periodic check to reschedule if needed
    refreshIntervalRef.current = setInterval(() => {
      scheduleTokenRefresh();
    }, REFRESH_CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isAuthenticated, scheduleTokenRefresh]);

  return {
    scheduleTokenRefresh,
  };
};

export default useSessionTimeout;
