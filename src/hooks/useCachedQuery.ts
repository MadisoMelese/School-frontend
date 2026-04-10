import { useState, useEffect, useCallback } from 'react';
import { useOfflineStore } from '@/store/offlineStore';
import { getCachedData, cacheData } from '@/services/offline/cacheService';

/**
 * useCachedQuery Hook
 * Fetches data from API and caches it for offline access
 * Returns cached data when offline
 */

export interface UseCachedQueryOptions<T> {
  storeName: string;
  cacheKey: string;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  cacheTTL?: number; // Time to live in milliseconds
}

export interface UseCachedQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isFromCache: boolean;
}

export const useCachedQuery = <T>({
  storeName,
  cacheKey,
  queryFn,
  enabled = true,
  onSuccess,
  onError,
  cacheTTL,
}: UseCachedQueryOptions<T>): UseCachedQueryResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  const { isOnline } = useOfflineStore();

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isOnline) {
        // Online: Fetch from API
        const result = await queryFn();
        setData(result);
        setIsFromCache(false);

        // Cache the result
        await cacheData(storeName, cacheKey, result, cacheTTL);

        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        // Offline: Try to get cached data
        const cachedResult = await getCachedData<T>(storeName, cacheKey);

        if (cachedResult) {
          setData(cachedResult);
          setIsFromCache(true);

          if (onSuccess) {
            onSuccess(cachedResult);
          }
        } else {
          throw new Error('No cached data available. Please connect to the internet.');
        }
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(errorObj);

      if (onError) {
        onError(errorObj);
      }

      // Try to get cached data as fallback
      if (isOnline) {
        const cachedResult = await getCachedData<T>(storeName, cacheKey);
        if (cachedResult) {
          setData(cachedResult);
          setIsFromCache(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [storeName, cacheKey, queryFn, enabled, isOnline, onSuccess, onError, cacheTTL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isFromCache,
  };
};

export default useCachedQuery;
