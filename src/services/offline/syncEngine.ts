import { apiClient } from '@/services/api/client';
import { useOfflineStore } from '@/store/offlineStore';
import {
  getPendingSyncItems,
  updateSyncItemStatus,
  incrementRetryCount,
  removeSyncItem,
  canRetry,
  SyncQueueItem,
} from './syncQueue';
import { reportOfflineSyncError } from '@/services/monitoring/errorReporter';
import {
  detectConflicts,
  logConflict,
  resolveConflictRemote,
  mergeVersions,
} from './conflictResolver';

/**
 * Sync Engine
 * Orchestrates offline sync: detects online status, syncs queue, handles conflicts
 */

let isSyncing = false;

/**
 * Initialize sync engine
 */
export const initializeSyncEngine = (): void => {
  // Listen to online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial status
  const offlineStore = useOfflineStore.getState();
  offlineStore.setOnline(navigator.onLine);
};

/**
 * Handle online event
 */
const handleOnline = async (): Promise<void> => {
  const offlineStore = useOfflineStore.getState();
  offlineStore.setOnline(true);

  // Trigger sync
  await syncPendingActions();
};

/**
 * Handle offline event
 */
const handleOffline = (): void => {
  const offlineStore = useOfflineStore.getState();
  offlineStore.setOnline(false);
};

/**
 * Sync pending actions
 */
export const syncPendingActions = async (): Promise<void> => {
  if (isSyncing) return;

  const offlineStore = useOfflineStore.getState();

  if (!offlineStore.isOnline) {
    return;
  }

  isSyncing = true;
  offlineStore.setSyncStatus('syncing');

  try {
    const pendingItems = await getPendingSyncItems();

    if (pendingItems.length === 0) {
      offlineStore.setSyncStatus('idle');
      isSyncing = false;
      return;
    }

    // Sync each pending item
    for (const item of pendingItems) {
      await syncItem(item);
    }

    offlineStore.setSyncStatus('idle');
    offlineStore.setSyncError(null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Sync failed';
    offlineStore.setSyncError(errorMessage);
    reportOfflineSyncError('sync_pending_actions', error, 0);
  } finally {
    isSyncing = false;
  }
};

/**
 * Sync individual item
 */
const syncItem = async (item: SyncQueueItem): Promise<void> => {
  try {
    // Update status to syncing
    await updateSyncItemStatus(item.id, 'syncing');

    // Execute sync based on type
    switch (item.type) {
      case 'create':
        await syncCreate(item);
        break;
      case 'update':
        await syncUpdate(item);
        break;
      case 'delete':
        await syncDelete(item);
        break;
    }

    // Remove from queue on success
    await removeSyncItem(item.id);
  } catch (error) {
    // Handle retry logic
    const canRetryItem = await canRetry(item.id);

    if (canRetryItem) {
      await incrementRetryCount(item.id);
      await updateSyncItemStatus(item.id, 'pending');
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      await updateSyncItemStatus(item.id, 'failed', errorMessage);
      reportOfflineSyncError(`sync_${item.type}`, error, item.retries);
    }
  }
};

/**
 * Sync create action
 */
const syncCreate = async (item: SyncQueueItem): Promise<void> => {
  const endpoint = getEndpointForResource(item.resource);
  await apiClient.post(endpoint, item.data);
};

/**
 * Sync update action with conflict detection
 */
const syncUpdate = async (item: SyncQueueItem): Promise<void> => {
  const endpoint = getEndpointForResource(item.resource, item.resourceId);
  
  try {
    // First, fetch the current remote version
    const remoteResponse = await apiClient.get(endpoint);
    const remoteData = remoteResponse.data;
    
    // Detect conflicts between local and remote data
    const localData = item.data as Record<string, unknown>;
    const conflicts = await detectConflicts(item.resource, localData, remoteData);
    
    if (conflicts.length > 0) {
      // Log conflicts for user review
      console.warn(`Detected ${conflicts.length} conflicts for ${item.resource}:${item.resourceId}`);
      
      // Apply conflict resolution strategy: prefer remote (server wins)
      const mergedData = mergeVersions(localData, remoteData);
      
      // Update with merged data
      await apiClient.put(endpoint, mergedData);
      
      // Resolve conflicts as remote
      for (const conflictId of conflicts) {
        await resolveConflictRemote(conflictId);
      }
    } else {
      // No conflicts, proceed with update
      await apiClient.put(endpoint, item.data);
    }
  } catch (error) {
    // If fetch fails (404), the resource might have been deleted remotely
    // In this case, log a conflict and skip the update
    if ((error as any)?.response?.status === 404) {
      await logConflict(
        item.resource,
        item.resourceId || '',
        item.data,
        { deleted: true }
      );
      console.warn(`Resource ${item.resource}:${item.resourceId} was deleted remotely`);
      return;
    }
    throw error;
  }
};

/**
 * Sync delete action
 */
const syncDelete = async (item: SyncQueueItem): Promise<void> => {
  const endpoint = getEndpointForResource(item.resource, item.resourceId);
  await apiClient.delete(endpoint);
};

/**
 * Get API endpoint for resource
 */
const getEndpointForResource = (resource: string, resourceId?: string): string => {
  const baseEndpoints: Record<string, string> = {
    attendance: '/teacher/attendance',
    grades: '/teacher/grades',
    messages: '/student/messages',
    profile: '/user/profile',
  };

  const baseEndpoint = baseEndpoints[resource] || `/${resource}`;

  if (resourceId) {
    return `${baseEndpoint}/${resourceId}`;
  }

  return baseEndpoint;
};

/**
 * Get sync status
 */
export const getSyncStatus = (): {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
} => {
  const offlineStore = useOfflineStore.getState();

  return {
    isOnline: offlineStore.isOnline,
    isSyncing: isSyncing,
    pendingCount: offlineStore.getPendingActionCount(),
  };
};

/**
 * Get detailed sync status including conflicts
 */
export const getDetailedSyncStatus = async (): Promise<{
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  conflictCount: number;
}> => {
  const offlineStore = useOfflineStore.getState();
  const { getUnresolvedConflicts } = await import('./conflictResolver');
  const conflicts = await getUnresolvedConflicts();

  return {
    isOnline: offlineStore.isOnline,
    isSyncing: isSyncing,
    pendingCount: offlineStore.getPendingActionCount(),
    conflictCount: conflicts.length,
  };
};

/**
 * Manual sync trigger
 */
export const manualSync = async (): Promise<void> => {
  await syncPendingActions();
};

/**
 * Cleanup sync engine
 */
export const cleanupSyncEngine = (): void => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
};

export default {
  initializeSyncEngine,
  syncPendingActions,
  getSyncStatus,
  getDetailedSyncStatus,
  manualSync,
  cleanupSyncEngine,
};
