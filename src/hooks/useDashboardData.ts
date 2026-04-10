import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * useDashboardData Hook
 * Manages dashboard data loading with real-time updates
 * Features:
 * - Automatic polling for updates
 * - Configurable refresh interval
 * - Error handling and retry logic
 * - Loading state management
 */

export interface UseDashboardDataOptions {
  refreshInterval?: number; // in milliseconds, default 30000 (30s)
  retryCount?: number; // number of retries on failure, default 3
  retryDelay?: number; // delay between retries in milliseconds, default 1000
  enabled?: boolean; // whether to enable polling, default true
}

export interface UseDashboardDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

export const useDashboardData = <T>(
  fetchFn: () => Promise<T>,
  options: UseDashboardDataOptions = {}
): UseDashboardDataResult<T> => {
  const { refreshInterval = 30000, retryCount = 3, retryDelay = 1000, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch data with retry logic
  const fetchData = useCallback(
    async (isRetry = false) => {
      if (!isMountedRef.current) return;

      try {
        if (!isRetry) {
          setLoading(true);
        } else {
          setIsRefetching(true);
        }
        setError(null);

        const result = await fetchFn();

        if (isMountedRef.current) {
          setData(result);
          setError(null);
          retryCountRef.current = 0;
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';

        if (retryCountRef.current < retryCount) {
          retryCountRef.current += 1;
          // Retry after delay
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchData(true);
            }
          }, retryDelay);
        } else {
          setError(errorMessage);
          retryCountRef.current = 0;
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefetching(false);
        }
      }
    },
    [fetchFn, retryCount, retryDelay]
  );

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, fetchData]);

  // Setup polling
  useEffect(() => {
    if (!enabled || refreshInterval <= 0) return;

    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchData(true);
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refreshInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refetch function
  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching,
  };
};

export default useDashboardData;
