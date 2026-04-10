import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { initializeSyncEngine, syncPendingActions, manualSync, cleanupSyncEngine } from './syncEngine';
import { queueAction, getActionsByStatus, clearCompletedActions } from './actionQueue';
import { logConflict, getUnresolvedConflicts, resolveConflictRemote } from './conflictResolver';
import { useOfflineStore } from '@/store/offlineStore';
import { apiClient } from '@/services/api/client';
import 'fake-indexeddb/auto';

/**
 * Integration tests for offline functionality
 * Tests the complete offline workflow: queue actions, sync, handle conflicts
 */

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

describe('Offline Functionality Integration Tests', () => {
  beforeAll(async () => {
    // Initialize IndexedDB for tests
    const { initializeDB } = await import('./indexedDB');
    await initializeDB();
  });
  beforeEach(() => {
    // Reset store
    const store = useOfflineStore.getState();
    store.clearPendingActions();
    store.setOnline(true);
    store.setSyncStatus('idle');
    store.setSyncError(null);

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanupSyncEngine();
  });

  describe('Action Queuing', () => {
    it('should queue an action when offline', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      const actionId = await queueAction('create', 'attendance', {
        studentId: '123',
        status: 'present',
        date: '2024-01-15',
      });

      expect(actionId).toBeDefined();
      expect(store.getPendingActionCount()).toBe(1);
    });

    it('should queue multiple actions', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      await queueAction('update', 'grades', { studentId: '2', marks: 85 }, 'grade-1');
      await queueAction('delete', 'messages', {}, 'msg-1');

      expect(store.getPendingActionCount()).toBe(3);
    });

    it('should retrieve pending actions by status', async () => {
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      
      const pendingActions = await getActionsByStatus('pending');
      expect(pendingActions.length).toBeGreaterThan(0);
      expect(pendingActions[0].status).toBe('pending');
    });
  });

  describe('Sync Engine', () => {
    it('should initialize sync engine and listen to online events', () => {
      initializeSyncEngine();
      
      const store = useOfflineStore.getState();
      expect(store.isOnline).toBe(navigator.onLine);
    });

    it('should sync pending actions when coming online', async () => {
      const store = useOfflineStore.getState();
      store.setOnline(false);

      // Queue actions while offline
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      
      // Mock API response
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      // Come back online and sync
      store.setOnline(true);
      await syncPendingActions();

      // Verify API was called
      expect(apiClient.post).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      
      // Mock API error
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await syncPendingActions();

      const store = useOfflineStore.getState();
      expect(store.syncError).toBeTruthy();
    });

    it('should support manual sync trigger', async () => {
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await manualSync();

      expect(apiClient.post).toHaveBeenCalled();
    });
  });

  describe('Conflict Resolution', () => {
    it('should detect conflicts during sync', async () => {
      const conflictId = await logConflict(
        'grades',
        'grade-1',
        { marks: 85, updatedAt: '2024-01-15T10:00:00Z' },
        { marks: 90, updatedAt: '2024-01-15T11:00:00Z' }
      );

      expect(conflictId).toBeDefined();

      const conflicts = await getUnresolvedConflicts();
      expect(conflicts.length).toBe(1);
      expect(conflicts[0].resource).toBe('grades');
    });

    it('should resolve conflicts with remote version', async () => {
      const conflictId = await logConflict(
        'grades',
        'grade-1',
        { marks: 85 },
        { marks: 90 }
      );

      await resolveConflictRemote(conflictId);

      const conflicts = await getUnresolvedConflicts();
      expect(conflicts.length).toBe(0);
    });

    it('should handle update conflicts during sync', async () => {
      await queueAction('update', 'grades', { marks: 85 }, 'grade-1');

      // Mock remote data with different value
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { marks: 90, updatedAt: '2024-01-15T11:00:00Z' },
      });
      vi.mocked(apiClient.put).mockResolvedValue({ data: { success: true } });

      await syncPendingActions();

      // Should have called get to check for conflicts
      expect(apiClient.get).toHaveBeenCalled();
      // Should have called put with merged data
      expect(apiClient.put).toHaveBeenCalled();
    });
  });

  describe('Offline Store Integration', () => {
    it('should update store when actions are queued', async () => {
      const store = useOfflineStore.getState();
      const initialCount = store.getPendingActionCount();

      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      expect(store.getPendingActionCount()).toBe(initialCount + 1);
    });

    it('should update store when actions are synced', async () => {
      const store = useOfflineStore.getState();
      
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      const countBeforeSync = store.getPendingActionCount();

      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });
      await syncPendingActions();

      // After successful sync, pending count should decrease
      await clearCompletedActions();
      expect(store.getPendingActionCount()).toBeLessThanOrEqual(countBeforeSync);
    });

    it('should update sync status during sync', async () => {
      const store = useOfflineStore.getState();
      
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      vi.mocked(apiClient.post).mockImplementation(() => {
        // Check status during sync
        expect(store.syncStatus).toBe('syncing');
        return Promise.resolve({ data: { success: true } });
      });

      await syncPendingActions();
    });
  });

  describe('End-to-End Offline Workflow', () => {
    it('should complete full offline workflow: queue -> sync -> resolve conflicts', async () => {
      const store = useOfflineStore.getState();
      
      // Step 1: Go offline
      store.setOnline(false);
      expect(store.isOnline).toBe(false);

      // Step 2: Queue actions while offline
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });
      await queueAction('update', 'grades', { marks: 85 }, 'grade-1');
      expect(store.getPendingActionCount()).toBe(2);

      // Step 3: Come back online
      store.setOnline(true);
      expect(store.isOnline).toBe(true);

      // Step 4: Mock API responses
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { marks: 90, updatedAt: '2024-01-15T11:00:00Z' },
      });
      vi.mocked(apiClient.put).mockResolvedValue({ data: { success: true } });

      // Step 5: Sync pending actions
      await syncPendingActions();

      // Step 6: Verify sync completed
      expect(apiClient.post).toHaveBeenCalled();
      expect(apiClient.get).toHaveBeenCalled();
      expect(apiClient.put).toHaveBeenCalled();

      // Step 7: Check for conflicts
      const conflicts = await getUnresolvedConflicts();
      
      // Step 8: Resolve any conflicts
      for (const conflict of conflicts) {
        await resolveConflictRemote(conflict.id);
      }

      // Step 9: Verify all conflicts resolved
      const remainingConflicts = await getUnresolvedConflicts();
      expect(remainingConflicts.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during sync', async () => {
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await syncPendingActions();

      const store = useOfflineStore.getState();
      expect(store.syncError).toBeTruthy();
      expect(store.syncStatus).toBe('error');
    });

    it('should retry failed actions', async () => {
      await queueAction('create', 'attendance', { studentId: '1', status: 'present' });

      // First attempt fails
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));
      await syncPendingActions();

      // Second attempt succeeds
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true } });
      await syncPendingActions();

      expect(apiClient.post).toHaveBeenCalledTimes(2);
    });

    it('should handle 404 errors as deleted resources', async () => {
      await queueAction('update', 'grades', { marks: 85 }, 'grade-1');

      const error: any = new Error('Not found');
      error.response = { status: 404 };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await syncPendingActions();

      // Should log conflict for deleted resource
      const conflicts = await getUnresolvedConflicts();
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });
});
