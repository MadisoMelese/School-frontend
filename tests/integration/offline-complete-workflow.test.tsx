/**
 * Complete Offline Workflow Integration Tests
 * 
 * Tests end-to-end offline scenarios with real components and stores
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOfflineStore } from '@/store/offlineStore';
import { initializeSyncEngine, syncPendingActions, cleanupSyncEngine } from '@/services/offline/syncEngine';
import { queueAction, getActionsByStatus, clearCompletedActions } from '@/services/offline/actionQueue';
import { OfflineIndicator } from '@/components/organisms/OfflineIndicator';
import { apiClient } from '@/services/api/client';
import 'fake-indexeddb/auto';

// Mock API client
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/services/monitoring/errorReporter', () => ({
  reportOfflineSyncError: vi.fn(),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Complete Offline Workflow Integration Tests', () => {
  beforeEach(async () => {
    // Initialize IndexedDB
    const { initializeDB, clearAllData } = await import('@/services/offline/indexedDB');
    await initializeDB();
    await clearAllData(); // Clear all data from previous tests

    // Reset offline store
    const store = useOfflineStore.getState();
    store.clearPendingActions();
    store.setOnline(true);
    store.setSyncStatus('idle');
    store.setSyncError(null);

    // Clear mocks
    vi.clearAllMocks();

    // Initialize sync engine
    initializeSyncEngine();
  });

  afterEach(() => {
    cleanupSyncEngine();
  });

  describe('Offline Indicator Integration', () => {
    it('should show offline indicator when network is lost', async () => {
      render(
        <TestWrapper>
          <OfflineIndicator />
        </TestWrapper>
      );

      // Initially online
      expect(screen.queryByText("You're offline")).not.toBeInTheDocument();

      // Simulate going offline
      act(() => {
        const store = useOfflineStore.getState();
        store.setOnline(false);
      });

      // Offline indicator should appear
      await waitFor(() => {
        expect(screen.getByText("You're offline")).toBeInTheDocument();
      });
    });

    it('should show pending action count in offline indicator', async () => {
      render(
        <TestWrapper>
          <OfflineIndicator />
        </TestWrapper>
      );

      // Go offline
      act(() => {
        const store = useOfflineStore.getState();
        store.setOnline(false);
      });

      // Queue actions
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      await queueAction('update', 'grades', { marks: 85 }, 'grade-1');
      await queueAction('delete', 'messages', {}, 'msg-1');

      // Should show pending count
      await waitFor(() => {
        expect(screen.getByText(/3 actions pending sync/i)).toBeInTheDocument();
      });
    });

    it('should update indicator when coming back online', async () => {
      render(
        <TestWrapper>
          <OfflineIndicator />
        </TestWrapper>
      );

      // Go offline
      act(() => {
        const store = useOfflineStore.getState();
        store.setOnline(false);
      });

      await waitFor(() => {
        expect(screen.getByText("You're offline")).toBeInTheDocument();
      });

      // Go back online
      act(() => {
        const store = useOfflineStore.getState();
        store.setOnline(true);
      });

      // Should show "Back online" message
      await waitFor(() => {
        expect(screen.getByText('Back online')).toBeInTheDocument();
      });
    });
  });

  describe('Action Queuing and Sync Workflow', () => {
    it('should queue action when offline and sync when online', async () => {
      const store = useOfflineStore.getState();

      // Go offline
      store.setOnline(false);

      // Queue an action
      const actionId = await queueAction('create', 'attendance', {
        studentId: '123',
        status: 'present',
        date: '2024-01-15',
      });

      expect(actionId).toBeDefined();
      expect(store.getPendingActionCount()).toBe(1);

      // Verify action is in pending state
      const pendingActions = await getActionsByStatus('pending');
      expect(pendingActions).toHaveLength(1);
      expect(pendingActions[0].type).toBe('create');
      expect(pendingActions[0].resource).toBe('attendance');

      // Mock successful API response
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      // Go back online and sync
      store.setOnline(true);
      await syncPendingActions();

      // Verify API was called
      expect(apiClient.post).toHaveBeenCalledWith(
        '/teacher/attendance',
        expect.objectContaining({
          studentId: '123',
          status: 'present',
        })
      );

      // Clean up completed actions
      await clearCompletedActions();

      // Pending count should decrease
      await waitFor(() => {
        expect(store.getPendingActionCount()).toBe(0);
      });
    });

    it('should handle multiple queued actions in order', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue multiple actions
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      await queueAction('update', 'grades', { marks: 85 }, 'grade-1');
      await queueAction('create', 'attendance', { studentId: '2', status: 'absent' });

      expect(store.getPendingActionCount()).toBe(3);

      // Mock API responses
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });
      vi.mocked(apiClient.get).mockResolvedValue({ data: { marks: 80 } });
      vi.mocked(apiClient.put).mockResolvedValue({ data: { success: true } });

      // Go online and sync
      store.setOnline(true);
      await syncPendingActions();

      // Verify all API calls were made
      expect(apiClient.post).toHaveBeenCalledTimes(2); // Two create actions
      expect(apiClient.get).toHaveBeenCalledTimes(1); // One update action (fetch first)
      expect(apiClient.put).toHaveBeenCalledTimes(1); // One update action
    });

    it('should retry failed actions', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Mock API failure
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      // Go online and sync (first attempt fails)
      store.setOnline(true);
      await syncPendingActions();

      // Action should still be pending (retry)
      const pendingActions = await getActionsByStatus('pending');
      expect(pendingActions.length).toBeGreaterThan(0);

      // Mock API success for retry
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true } });

      // Sync again (retry)
      await syncPendingActions();

      // Verify API was called twice
      expect(apiClient.post).toHaveBeenCalledTimes(2);
    });

    it('should mark action as failed after max retries', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Mock API failure
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      // Go online and sync multiple times (exceed max retries)
      store.setOnline(true);
      
      for (let i = 0; i < 5; i++) {
        await syncPendingActions();
      }

      // Action should be marked as failed
      const failedActions = await getActionsByStatus('failed');
      expect(failedActions.length).toBeGreaterThan(0);
      expect(failedActions[0].status).toBe('failed');
      expect(failedActions[0].error).toBeTruthy();
    });
  });

  describe('Conflict Resolution Workflow', () => {
    it('should detect and resolve update conflicts', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an update action
      await queueAction('update', 'grades', { marks: 85, updatedAt: '2024-01-15T10:00:00Z' }, 'grade-1');

      // Mock remote data with different value (conflict)
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { marks: 90, updatedAt: '2024-01-15T11:00:00Z' },
      });
      vi.mocked(apiClient.put).mockResolvedValue({ data: { success: true } });

      // Go online and sync
      store.setOnline(true);
      await syncPendingActions();

      // Verify conflict detection (get was called)
      expect(apiClient.get).toHaveBeenCalledWith('/teacher/grades/grade-1');

      // Verify update was called with merged data (server wins)
      expect(apiClient.put).toHaveBeenCalled();
      const putCall = vi.mocked(apiClient.put).mock.calls[0];
      expect(putCall[1]).toEqual(expect.objectContaining({ marks: 90 }));
    });

    it('should handle deleted resource conflict', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an update action
      await queueAction('update', 'grades', { marks: 85 }, 'grade-1');

      // Mock 404 error (resource deleted remotely)
      const error: any = new Error('Not found');
      error.response = { status: 404 };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      // Go online and sync
      store.setOnline(true);
      await syncPendingActions();

      // Verify get was called
      expect(apiClient.get).toHaveBeenCalled();

      // Update should not be called (resource deleted)
      expect(apiClient.put).not.toHaveBeenCalled();

      // Conflict should be logged
      const { getUnresolvedConflicts } = await import('@/services/offline/conflictResolver');
      const conflicts = await getUnresolvedConflicts();
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('Sync Status Updates', () => {
    it('should update sync status during sync', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Mock API with delay
      vi.mocked(apiClient.post).mockImplementation(() => {
        // Check status during sync
        expect(store.syncStatus).toBe('syncing');
        return Promise.resolve({ data: { success: true } });
      });

      // Go online and sync
      store.setOnline(true);
      await syncPendingActions();

      // Status should be back to idle after sync
      expect(store.syncStatus).toBe('idle');
    });

    it('should set error status on sync failure', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Mock API failure for all retries
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      // Go online and sync multiple times to exceed retries
      store.setOnline(true);
      for (let i = 0; i < 5; i++) {
        await syncPendingActions();
      }

      // Status should be error after max retries
      await waitFor(() => {
        expect(store.syncError).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should clear error on successful sync', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Mock API failure for all retries to set error state
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));
      
      store.setOnline(true);
      for (let i = 0; i < 5; i++) {
        await syncPendingActions();
      }

      // Verify error is set
      await waitFor(() => {
        expect(store.syncError).toBeTruthy();
      }, { timeout: 2000 });

      // Queue a new action
      store.setOnline(false);
      await queueAction('create', 'attendance', { studentId: '2', status: 'present' });

      // Mock API success
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      // Sync again
      store.setOnline(true);
      await syncPendingActions();

      // Error should be cleared
      await waitFor(() => {
        expect(store.syncError).toBeNull();
      }, { timeout: 2000 });
    });
  });

  describe('Persistence Across Sessions', () => {
    it('should persist queued actions in IndexedDB', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue actions
      const actionId1 = await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      const actionId2 = await queueAction('update', 'grades', { marks: 85 }, 'grade-1');

      // Verify actions are in IndexedDB
      const { getSyncItem } = await import('@/services/offline/syncQueue');
      const action1 = await getSyncItem(actionId1);
      const action2 = await getSyncItem(actionId2);

      expect(action1).toBeDefined();
      expect(action1?.type).toBe('create');
      expect(action2).toBeDefined();
      expect(action2?.type).toBe('update');
    });

    it('should load queued actions on app restart', async () => {
      // Queue actions
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      await queueAction('update', 'grades', { marks: 85 }, 'grade-1');

      // Simulate app restart by getting all sync items
      const { getAllSyncItems } = await import('@/services/offline/syncQueue');
      const items = await getAllSyncItems();

      expect(items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Network State Transitions', () => {
    it('should handle rapid online/offline transitions', async () => {
      const store = useOfflineStore.getState();

      // Rapid transitions
      for (let i = 0; i < 5; i++) {
        store.setOnline(false);
        store.setOnline(true);
      }

      // Should end up online
      expect(store.isOnline).toBe(true);
      expect(store.syncStatus).toBe('idle');
    });

    it('should not sync while offline', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Try to sync while offline
      await syncPendingActions();

      // API should not be called
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should handle sync interruption by going offline', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue multiple actions
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      await queueAction('create', 'attendance', { studentId: '2', status: 'absent' });

      // Mock API with delay
      let callCount = 0;
      vi.mocked(apiClient.post).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Go offline during first sync
          store.setOnline(false);
        }
        return Promise.resolve({ data: { success: true } });
      });

      // Go online and start sync
      store.setOnline(true);
      await syncPendingActions();

      // Some actions may not sync due to going offline
      // This tests graceful handling of interruption
      expect(apiClient.post).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle IndexedDB errors gracefully', async () => {
      // Mock IndexedDB error
      const { setItem } = await import('@/services/offline/indexedDB');
      vi.spyOn(await import('@/services/offline/indexedDB'), 'setItem').mockRejectedValue(
        new Error('IndexedDB error')
      );

      // Try to queue an action
      await expect(
        queueAction('create', 'attendance', { studentId: '1', status: 'present' })
      ).rejects.toThrow();
    });

    it('should handle API timeout errors', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Mock API timeout for all retries
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Timeout'));

      // Go online and sync multiple times
      store.setOnline(true);
      for (let i = 0; i < 5; i++) {
        await syncPendingActions();
      }

      // Should handle timeout gracefully (error set after max retries)
      await waitFor(() => {
        expect(store.syncError).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should handle malformed API responses', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue an action
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // Mock malformed response
      vi.mocked(apiClient.post).mockResolvedValue({ data: null } as any);

      // Go online and sync
      store.setOnline(true);
      await syncPendingActions();

      // Should handle gracefully (may succeed or fail depending on validation)
      expect(apiClient.post).toHaveBeenCalled();
    });
  });
});
