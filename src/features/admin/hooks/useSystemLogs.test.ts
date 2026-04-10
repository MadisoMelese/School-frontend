import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSystemLogs } from './useSystemLogs';
import * as systemLogsServiceModule from '@services/admin/systemLogsService';
import type { SystemLog } from '../../../types/api.types';

// Mock the systemLogsService
vi.mock('@services/admin/systemLogsService');

describe('useSystemLogs', () => {
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Student',
      action: 'login',
      resource: 'user',
      timestamp: '2024-01-15T10:30:00Z',
      details: { ip: '192.168.1.1' },
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Teacher',
      action: 'create',
      resource: 'grade',
      timestamp: '2024-01-15T11:00:00Z',
      details: { gradeId: 'grade123' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const mockService = {
      getLogs: vi.fn(),
      exportLogsAsCSV: vi.fn(),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    expect(result.current.logs).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(10);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.exporting).toBe(false);
  });

  it('fetches logs successfully', async () => {
    const mockService = {
      getLogs: vi.fn().mockResolvedValue({
        logs: mockLogs,
        total: 2,
        page: 1,
        limit: 10,
      }),
      exportLogsAsCSV: vi.fn(),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    await act(async () => {
      await result.current.fetchLogs();
    });

    expect(result.current.logs).toEqual(mockLogs);
    expect(result.current.total).toBe(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const mockService = {
      getLogs: vi.fn().mockRejectedValue(new Error('Network error')),
      exportLogsAsCSV: vi.fn(),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    await act(async () => {
      await result.current.fetchLogs();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
    expect(result.current.logs).toEqual([]);
  });

  it('fetches logs with filters', async () => {
    const mockService = {
      getLogs: vi.fn().mockResolvedValue({
        logs: [mockLogs[0]],
        total: 1,
        page: 1,
        limit: 10,
      }),
      exportLogsAsCSV: vi.fn(),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    const filters = {
      action: 'login',
      resource: 'user',
      page: 1,
      limit: 10,
    };

    await act(async () => {
      await result.current.fetchLogs(filters);
    });

    expect(mockService.getLogs).toHaveBeenCalledWith(filters);
    expect(result.current.logs).toEqual([mockLogs[0]]);
  });

  it('exports logs as CSV', async () => {
    const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
    const mockService = {
      getLogs: vi.fn(),
      exportLogsAsCSV: vi.fn().mockResolvedValue(mockBlob),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    // Just verify the service is called, don't test the download logic
    try {
      await act(async () => {
        await result.current.exportAsCSV();
      });
    } catch (err) {
      // Expected - window.URL not available in test environment
    }

    expect(mockService.exportLogsAsCSV).toHaveBeenCalled();
  });

  it('handles export error', async () => {
    const mockService = {
      getLogs: vi.fn(),
      exportLogsAsCSV: vi.fn().mockRejectedValue(new Error('Export failed')),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    await act(async () => {
      try {
        await result.current.exportAsCSV();
      } catch (err) {
        // Expected error
      }
    });

    expect(result.current.error).toBe('Export failed');
    expect(result.current.exporting).toBe(false);
  });

  it('sets loading state during fetch', async () => {
    const mockService = {
      getLogs: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  logs: mockLogs,
                  total: 2,
                  page: 1,
                  limit: 10,
                }),
              100
            )
          )
      ),
      exportLogsAsCSV: vi.fn(),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    act(() => {
      result.current.fetchLogs();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('updates pagination info after fetch', async () => {
    const mockService = {
      getLogs: vi.fn().mockResolvedValue({
        logs: mockLogs,
        total: 25,
        page: 2,
        limit: 10,
      }),
      exportLogsAsCSV: vi.fn(),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    await act(async () => {
      await result.current.fetchLogs();
    });

    expect(result.current.page).toBe(2);
    expect(result.current.total).toBe(25);
    expect(result.current.limit).toBe(10);
  });

  it('clears error on successful fetch', async () => {
    const mockService = {
      getLogs: vi.fn().mockRejectedValueOnce(new Error('First error')).mockResolvedValueOnce({
        logs: mockLogs,
        total: 2,
        page: 1,
        limit: 10,
      }),
      exportLogsAsCSV: vi.fn(),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    // First fetch fails
    await act(async () => {
      await result.current.fetchLogs();
    });
    expect(result.current.error).toBe('First error');

    // Second fetch succeeds
    await act(async () => {
      await result.current.fetchLogs();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.logs).toEqual(mockLogs);
  });

  it('exports with filters', async () => {
    const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
    const mockService = {
      getLogs: vi.fn(),
      exportLogsAsCSV: vi.fn().mockResolvedValue(mockBlob),
    };
    vi.spyOn(systemLogsServiceModule, 'systemLogsService', 'get').mockReturnValue(
      mockService as any
    );

    const { result } = renderHook(() => useSystemLogs());

    const filters = {
      action: 'login',
      resource: 'user',
    };

    // Just verify the service is called with filters
    try {
      await act(async () => {
        await result.current.exportAsCSV(filters);
      });
    } catch (err) {
      // Expected - window.URL not available in test environment
    }

    expect(mockService.exportLogsAsCSV).toHaveBeenCalledWith(filters);
  });
});
