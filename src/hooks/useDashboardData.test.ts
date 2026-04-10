import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from './useDashboardData';

describe('useDashboardData Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Initial Load', () => {
    it('loads data successfully', async () => {
      const mockData = { id: '1', name: 'Test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardData(fetchFn));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('handles fetch errors', async () => {
      const errorMessage = 'Fetch failed';
      const fetchFn = vi.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDashboardData(fetchFn, { retryCount: 0 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.data).toBeNull();
    });

    it('disables polling when enabled is false', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardData(fetchFn, { enabled: false }));

      expect(result.current.loading).toBe(true);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe('Polling', () => {
    it('polls data at specified interval', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const refreshInterval = 5000;

      const { result } = renderHook(() => useDashboardData(fetchFn, { refreshInterval }));

      // Initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Advance time to trigger polling
      vi.advanceTimersByTime(refreshInterval);

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      // Advance time again
      vi.advanceTimersByTime(refreshInterval);

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(3);
      });
    });

    it('disables polling when refreshInterval is 0', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardData(fetchFn, { refreshInterval: 0 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial fetch only
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Advance time
      vi.advanceTimersByTime(10000);

      // Should still be 1 call (no polling)
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry Logic', () => {
    it('retries on failure', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(mockData);

      const { result } = renderHook(() =>
        useDashboardData(fetchFn, { retryCount: 1, retryDelay: 100 })
      );

      expect(result.current.loading).toBe(true);

      // Wait for first attempt
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // Advance time for retry delay
      vi.advanceTimersByTime(100);

      // Wait for retry
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('stops retrying after max retries', async () => {
      const errorMessage = 'Persistent error';
      const fetchFn = vi.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useDashboardData(fetchFn, { retryCount: 2, retryDelay: 100 })
      );

      // Initial attempt
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // First retry
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      // Second retry
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(3);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.data).toBeNull();
    });
  });

  describe('Manual Refetch', () => {
    it('refetches data on demand', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardData(fetchFn, { refreshInterval: 0 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Manual refetch
      result.current.refetch();

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });
    });

    it('sets isRefetching flag during manual refetch', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useDashboardData(fetchFn, { refreshInterval: 0 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isRefetching).toBe(false);

      // Manual refetch
      result.current.refetch();

      // isRefetching should be true during refetch
      expect(result.current.isRefetching).toBe(true);

      await waitFor(() => {
        expect(result.current.isRefetching).toBe(false);
      });
    });
  });

  describe('State Management', () => {
    it('maintains data during refetch', async () => {
      const mockData = { id: '1', value: 'initial' };
      const updatedData = { id: '1', value: 'updated' };
      const fetchFn = vi.fn().mockResolvedValueOnce(mockData).mockResolvedValueOnce(updatedData);

      const { result } = renderHook(() => useDashboardData(fetchFn, { refreshInterval: 0 }));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      // Manual refetch
      result.current.refetch();

      // Data should still be available during refetch
      expect(result.current.data).toEqual(mockData);

      await waitFor(() => {
        expect(result.current.data).toEqual(updatedData);
      });
    });

    it('clears error on successful refetch', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useDashboardData(fetchFn, { retryCount: 0 }));

      await waitFor(() => {
        expect(result.current.error).toBe('Error');
      });

      // Manual refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.data).toEqual(mockData);
      });
    });
  });

  describe('Cleanup', () => {
    it('clears interval on unmount', async () => {
      const mockData = { id: '1' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useDashboardData(fetchFn, { refreshInterval: 5000 }));

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalled();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});
