/**
 * useActionQueue Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useActionQueue } from './useActionQueue';
import * as actionQueue from '@/services/offline/actionQueue';
import { useOfflineStore } from '@/store/offlineStore';

// Mock dependencies
vi.mock('@/services/offline/actionQueue');
vi.mock('@/store/offlineStore');

describe('useActionQueue Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock offline store
    vi.mocked(useOfflineStore).mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
    } as any);

    // Mock action queue functions
    vi.mocked(actionQueue.getAllActions).mockResolvedValue([]);
    vi.mocked(actionQueue.getActionQueueStats).mockResolvedValue({
      total: 0,
      pending: 0,
      syncing: 0,
      completed: 0,
      failed: 0,
    });
    vi.mocked(actionQueue.isQueueEmpty).mockResolvedValue(true);
    vi.mocked(actionQueue.hasPendingActions).mockResolvedValue(false);
    vi.mocked(actionQueue.hasFailedActions).mockResolvedValue(false);
  });

  describe('initialization', () => {
    it('should load actions on mount', async () => {
      const mockActions = [
        {
          id: 'action-1',
          type: 'create' as const,
          resource: 'attendance',
          data: {},
          status: 'pending' as const,
          timestamp: Date.now(),
          retries: 0,
          maxRetries: 3,
        },
      ];

      vi.mocked(actionQueue.getAllActions).mockResolvedValue(mockActions);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.actions).toHaveLength(1);
      expect(result.current.actions[0].id).toBe('action-1');
    });

    it('should load stats on mount', async () => {
      const mockStats = {
        total: 5,
        pending: 2,
        syncing: 1,
        completed: 1,
        failed: 1,
      };

      vi.mocked(actionQueue.getActionQueueStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStats);
    });

    it('should set utilities on mount', async () => {
      vi.mocked(actionQueue.isQueueEmpty).mockResolvedValue(false);
      vi.mocked(actionQueue.hasPendingActions).mockResolvedValue(true);
      vi.mocked(actionQueue.hasFailedActions).mockResolvedValue(true);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isEmpty).toBe(false);
      expect(result.current.hasPending).toBe(true);
      expect(result.current.hasFailed).toBe(true);
    });
  });

  describe('queue action', () => {
    it('should queue an action', async () => {
      const mockActionId = 'action-123';
      vi.mocked(actionQueue.queueAction).mockResolvedValue(mockActionId);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const actionId = await result.current.queue('create', 'attendance', { status: 'present' });

      expect(actionId).toBe(mockActionId);
      expect(actionQueue.queueAction).toHaveBeenCalledWith(
        'create',
        'attendance',
        { status: 'present' },
        undefined,
        undefined
      );
    });

    it('should queue an action with metadata', async () => {
      const mockActionId = 'action-456';
      vi.mocked(actionQueue.queueAction).mockResolvedValue(mockActionId);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const metadata = { userId: 'user-123' };
      await result.current.queue('update', 'grades', { marks: 95 }, 'grade-123', metadata);

      expect(actionQueue.queueAction).toHaveBeenCalledWith(
        'update',
        'grades',
        { marks: 95 },
        'grade-123',
        metadata
      );
    });

    it('should refresh actions after queuing', async () => {
      const mockActionId = 'action-123';
      vi.mocked(actionQueue.queueAction).mockResolvedValue(mockActionId);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the call count after initial load
      vi.mocked(actionQueue.getAllActions).mockClear();

      await result.current.queue('create', 'attendance', { status: 'present' });

      // Should be called once after queuing
      await waitFor(() => {
        expect(actionQueue.getAllActions).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('get actions', () => {
    it('should get action by ID', async () => {
      const mockAction = {
        id: 'action-123',
        type: 'create' as const,
        resource: 'attendance',
        data: {},
        status: 'pending' as const,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3,
      };

      vi.mocked(actionQueue.getAction).mockResolvedValue(mockAction);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const action = await result.current.getById('action-123');

      expect(action).toEqual(mockAction);
    });

    it('should get actions by status', async () => {
      const mockActions = [
        {
          id: 'action-1',
          type: 'create' as const,
          resource: 'attendance',
          data: {},
          status: 'pending' as const,
          timestamp: Date.now(),
          retries: 0,
          maxRetries: 3,
        },
      ];

      vi.mocked(actionQueue.getActionsByStatus).mockResolvedValue(mockActions);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const actions = await result.current.getByStatus('pending');

      expect(actions).toEqual(mockActions);
    });

    it('should get actions by resource', async () => {
      const mockActions = [
        {
          id: 'action-1',
          type: 'create' as const,
          resource: 'attendance',
          data: {},
          status: 'pending' as const,
          timestamp: Date.now(),
          retries: 0,
          maxRetries: 3,
        },
      ];

      vi.mocked(actionQueue.getActionsByResource).mockResolvedValue(mockActions);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const actions = await result.current.getByResource('attendance');

      expect(actions).toEqual(mockActions);
    });
  });

  describe('update action', () => {
    it('should update action status', async () => {
      vi.mocked(actionQueue.updateActionStatus).mockResolvedValue();

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.updateStatus('action-123', 'syncing');

      expect(actionQueue.updateActionStatus).toHaveBeenCalledWith('action-123', 'syncing', undefined);
    });

    it('should update action status with error', async () => {
      vi.mocked(actionQueue.updateActionStatus).mockResolvedValue();

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.updateStatus('action-123', 'failed', 'Network error');

      expect(actionQueue.updateActionStatus).toHaveBeenCalledWith(
        'action-123',
        'failed',
        'Network error'
      );
    });
  });

  describe('remove action', () => {
    it('should remove action', async () => {
      vi.mocked(actionQueue.removeAction).mockResolvedValue();

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.remove('action-123');

      expect(actionQueue.removeAction).toHaveBeenCalledWith('action-123');
    });
  });

  describe('clear actions', () => {
    it('should clear completed actions', async () => {
      vi.mocked(actionQueue.clearCompletedActions).mockResolvedValue();

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.clearCompleted();

      expect(actionQueue.clearCompletedActions).toHaveBeenCalled();
    });

    it('should clear failed actions', async () => {
      vi.mocked(actionQueue.clearFailedActions).mockResolvedValue();

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.clearFailed();

      expect(actionQueue.clearFailedActions).toHaveBeenCalled();
    });
  });

  describe('retry actions', () => {
    it('should retry action', async () => {
      vi.mocked(actionQueue.retryAction).mockResolvedValue();

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.retry('action-123');

      expect(actionQueue.retryAction).toHaveBeenCalledWith('action-123');
    });

    it('should retry all failed actions', async () => {
      vi.mocked(actionQueue.retryAllFailedActions).mockResolvedValue();

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.retryAllFailed();

      expect(actionQueue.retryAllFailedActions).toHaveBeenCalled();
    });
  });

  describe('filtering', () => {
    it('should filter by status', async () => {
      const mockPendingActions = [
        {
          id: 'action-1',
          type: 'create' as const,
          resource: 'attendance',
          data: {},
          status: 'pending' as const,
          timestamp: Date.now(),
          retries: 0,
          maxRetries: 3,
        },
      ];

      vi.mocked(actionQueue.getActionsByStatus).mockResolvedValue(mockPendingActions);

      const { result } = renderHook(() => useActionQueue({ filterStatus: 'pending' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(actionQueue.getActionsByStatus).toHaveBeenCalledWith('pending');
      expect(result.current.actions).toEqual(mockPendingActions);
    });

    it('should filter by resource', async () => {
      const mockAttendanceActions = [
        {
          id: 'action-1',
          type: 'create' as const,
          resource: 'attendance',
          data: {},
          status: 'pending' as const,
          timestamp: Date.now(),
          retries: 0,
          maxRetries: 3,
        },
      ];

      vi.mocked(actionQueue.getActionsByResource).mockResolvedValue(mockAttendanceActions);

      const { result } = renderHook(() => useActionQueue({ filterResource: 'attendance' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(actionQueue.getActionsByResource).toHaveBeenCalledWith('attendance');
      expect(result.current.actions).toEqual(mockAttendanceActions);
    });
  });

  describe('error handling', () => {
    it('should handle errors when loading actions', async () => {
      const error = new Error('Failed to load');
      vi.mocked(actionQueue.getAllActions).mockRejectedValue(error);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load');
    });

    it('should handle errors when queuing action', async () => {
      const error = new Error('Failed to queue');
      vi.mocked(actionQueue.queueAction).mockRejectedValue(error);

      const { result } = renderHook(() => useActionQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.queue('create', 'attendance', { status: 'present' })
      ).rejects.toThrow('Failed to queue');

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to queue');
      });
    });
  });
});
