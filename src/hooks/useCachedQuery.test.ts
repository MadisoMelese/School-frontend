import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCachedQuery } from './useCachedQuery';
import * as offlineStore from '@/store/offlineStore';
import * as cacheService from '@/services/offline/cacheService';

vi.mock('@/store/offlineStore');
vi.mock('@/services/offline/cacheService');

describe('useCachedQuery Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Online Mode', () => {
    beforeEach(() => {
      vi.spyOn(offlineStore, 'useOfflineStore').mockReturnValue({
        isOnline: true,
      } as any);
    });

    it('should fetch data from API when online', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockQueryFn = vi.fn().mockResolvedValue(mockData);
      const mockCacheData = vi.spyOn(cacheService, 'cacheData').mockResolvedValue();

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
        })
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryFn).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isFromCache).toBe(false);
      expect(mockCacheData).toHaveBeenCalledWith('grades', 'test-key', mockData, undefined);
    });

    it('should call onSuccess callback when data is fetched', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockQueryFn = vi.fn().mockResolvedValue(mockData);
      const mockOnSuccess = vi.fn();
      vi.spyOn(cacheService, 'cacheData').mockResolvedValue();

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
          onSuccess: mockOnSuccess,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
    });

    it('should handle API errors and try to get cached data', async () => {
      const mockError = new Error('API Error');
      const mockQueryFn = vi.fn().mockRejectedValue(mockError);
      const mockCachedData = { id: '1', name: 'Cached' };
      const mockGetCachedData = vi
        .spyOn(cacheService, 'getCachedData')
        .mockResolvedValue(mockCachedData);
      const mockOnError = vi.fn();

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
          onError: mockOnError,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockOnError).toHaveBeenCalledWith(mockError);
      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toEqual(mockCachedData);
      expect(result.current.isFromCache).toBe(true);
      expect(mockGetCachedData).toHaveBeenCalledWith('grades', 'test-key');
    });

    it('should not fetch when enabled is false', async () => {
      const mockQueryFn = vi.fn();

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
          enabled: false,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryFn).not.toHaveBeenCalled();
      expect(result.current.data).toBeNull();
    });
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      vi.spyOn(offlineStore, 'useOfflineStore').mockReturnValue({
        isOnline: false,
      } as any);
    });

    it('should get cached data when offline', async () => {
      const mockCachedData = { id: '1', name: 'Cached' };
      const mockQueryFn = vi.fn();
      const mockGetCachedData = vi
        .spyOn(cacheService, 'getCachedData')
        .mockResolvedValue(mockCachedData);

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryFn).not.toHaveBeenCalled();
      expect(mockGetCachedData).toHaveBeenCalledWith('grades', 'test-key');
      expect(result.current.data).toEqual(mockCachedData);
      expect(result.current.error).toBeNull();
      expect(result.current.isFromCache).toBe(true);
    });

    it('should show error when no cached data is available offline', async () => {
      const mockQueryFn = vi.fn();
      const mockGetCachedData = vi.spyOn(cacheService, 'getCachedData').mockResolvedValue(null);
      const mockOnError = vi.fn();

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
          onError: mockOnError,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetCachedData).toHaveBeenCalledWith('grades', 'test-key');
      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(
        new Error('No cached data available. Please connect to the internet.')
      );
      expect(mockOnError).toHaveBeenCalled();
    });

    it('should call onSuccess with cached data when offline', async () => {
      const mockCachedData = { id: '1', name: 'Cached' };
      const mockQueryFn = vi.fn();
      const mockOnSuccess = vi.fn();
      vi.spyOn(cacheService, 'getCachedData').mockResolvedValue(mockCachedData);

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
          onSuccess: mockOnSuccess,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(mockCachedData);
    });
  });

  describe('Refetch', () => {
    it('should refetch data when refetch is called', async () => {
      vi.spyOn(offlineStore, 'useOfflineStore').mockReturnValue({
        isOnline: true,
      } as any);

      const mockData1 = { id: '1', name: 'First' };
      const mockData2 = { id: '2', name: 'Second' };
      const mockQueryFn = vi
        .fn()
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);
      vi.spyOn(cacheService, 'cacheData').mockResolvedValue();

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData1);

      // Refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2);
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Custom TTL', () => {
    it('should use custom TTL when provided', async () => {
      vi.spyOn(offlineStore, 'useOfflineStore').mockReturnValue({
        isOnline: true,
      } as any);

      const mockData = { id: '1', name: 'Test' };
      const mockQueryFn = vi.fn().mockResolvedValue(mockData);
      const mockCacheData = vi.spyOn(cacheService, 'cacheData').mockResolvedValue();
      const customTTL = 5000;

      const { result } = renderHook(() =>
        useCachedQuery({
          storeName: 'grades',
          cacheKey: 'test-key',
          queryFn: mockQueryFn,
          cacheTTL: customTTL,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockCacheData).toHaveBeenCalledWith('grades', 'test-key', mockData, customTTL);
    });
  });
});
