/**
 * Action Queue Service
 * Provides API for queuing, tracking, and managing offline actions
 * Integrates with syncQueue and offlineStore
 */

import {
  addToSyncQueue,
  getSyncItem,
  updateSyncItemStatus,
  removeSyncItem,
  getAllSyncItems,
  getPendingSyncItems,
  getFailedSyncItems,
  getSyncItemsByResource,
  SyncQueueItem,
} from './syncQueue';
import { useOfflineStore } from '@/store/offlineStore';

/**
 * Action status enum
 */
export type ActionStatus = 'pending' | 'syncing' | 'completed' | 'failed';

/**
 * Queued action interface
 */
export interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  resourceId?: string;
  data: unknown;
  status: ActionStatus;
  timestamp: number;
  retries: number;
  maxRetries: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Action queue statistics
 */
export interface ActionQueueStats {
  total: number;
  pending: number;
  syncing: number;
  completed: number;
  failed: number;
}

/**
 * Queue an action for offline sync
 * @param type - Action type (create, update, delete)
 * @param resource - Resource name (e.g., 'attendance', 'grades')
 * @param data - Action data payload
 * @param resourceId - Optional resource ID for update/delete
 * @param metadata - Optional metadata for tracking
 * @returns Action ID
 */
export const queueAction = async (
  type: 'create' | 'update' | 'delete',
  resource: string,
  data: unknown,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<string> => {
  // Add to IndexedDB sync queue
  const actionId = await addToSyncQueue(type, resource, data, resourceId);

  // Update offline store
  const offlineStore = useOfflineStore.getState();
  offlineStore.addPendingAction({
    type,
    resource,
    resourceId,
    data,
  });

  // Store metadata if provided
  if (metadata) {
    const item = await getSyncItem(actionId);
    if (item) {
      const updatedItem = {
        ...item,
        metadata,
      };
      await updateSyncItemStatus(actionId, item.status);
    }
  }

  return actionId;
};

/**
 * Get action by ID
 * @param actionId - Action ID
 * @returns Queued action or undefined
 */
export const getAction = async (actionId: string): Promise<QueuedAction | undefined> => {
  const item = await getSyncItem(actionId);
  if (!item) return undefined;

  return mapSyncItemToQueuedAction(item);
};

/**
 * Get all queued actions
 * @returns Array of queued actions
 */
export const getAllActions = async (): Promise<QueuedAction[]> => {
  const items = await getAllSyncItems();
  return items.map(mapSyncItemToQueuedAction);
};

/**
 * Get actions by status
 * @param status - Action status
 * @returns Array of queued actions
 */
export const getActionsByStatus = async (status: ActionStatus): Promise<QueuedAction[]> => {
  let items: SyncQueueItem[] = [];

  switch (status) {
    case 'pending':
      items = await getPendingSyncItems();
      break;
    case 'failed':
      items = await getFailedSyncItems();
      break;
    case 'syncing':
    case 'completed':
      // Get all and filter
      const allItems = await getAllSyncItems();
      items = allItems.filter((item) => item.status === status);
      break;
  }

  return items.map(mapSyncItemToQueuedAction);
};

/**
 * Get actions by resource
 * @param resource - Resource name
 * @returns Array of queued actions
 */
export const getActionsByResource = async (resource: string): Promise<QueuedAction[]> => {
  const items = await getSyncItemsByResource(resource);
  return items.map(mapSyncItemToQueuedAction);
};

/**
 * Update action status
 * @param actionId - Action ID
 * @param status - New status
 * @param error - Optional error message
 */
export const updateActionStatus = async (
  actionId: string,
  status: ActionStatus,
  error?: string
): Promise<void> => {
  // Map ActionStatus to SyncQueueItem status
  const syncStatus = status === 'completed' ? 'pending' : status;
  await updateSyncItemStatus(actionId, syncStatus as 'pending' | 'syncing' | 'failed', error);

  // Update offline store if needed
  if (status === 'completed') {
    const offlineStore = useOfflineStore.getState();
    offlineStore.removePendingAction(actionId);
  }
};

/**
 * Remove action from queue
 * @param actionId - Action ID
 */
export const removeAction = async (actionId: string): Promise<void> => {
  await removeSyncItem(actionId);

  // Update offline store
  const offlineStore = useOfflineStore.getState();
  offlineStore.removePendingAction(actionId);
};

/**
 * Clear all completed actions
 */
export const clearCompletedActions = async (): Promise<void> => {
  const completedActions = await getActionsByStatus('completed');

  for (const action of completedActions) {
    await removeAction(action.id);
  }
};

/**
 * Clear all failed actions
 */
export const clearFailedActions = async (): Promise<void> => {
  const failedActions = await getActionsByStatus('failed');

  for (const action of failedActions) {
    await removeAction(action.id);
  }
};

/**
 * Retry failed action
 * @param actionId - Action ID
 */
export const retryAction = async (actionId: string): Promise<void> => {
  await updateActionStatus(actionId, 'pending');
};

/**
 * Retry all failed actions
 */
export const retryAllFailedActions = async (): Promise<void> => {
  const failedActions = await getActionsByStatus('failed');

  for (const action of failedActions) {
    await retryAction(action.id);
  }
};

/**
 * Get action queue statistics
 * @returns Action queue statistics
 */
export const getActionQueueStats = async (): Promise<ActionQueueStats> => {
  const allActions = await getAllActions();

  const stats: ActionQueueStats = {
    total: allActions.length,
    pending: 0,
    syncing: 0,
    completed: 0,
    failed: 0,
  };

  for (const action of allActions) {
    stats[action.status]++;
  }

  return stats;
};

/**
 * Check if action queue is empty
 * @returns True if queue is empty
 */
export const isQueueEmpty = async (): Promise<boolean> => {
  const actions = await getAllActions();
  return actions.length === 0;
};

/**
 * Check if action queue has pending actions
 * @returns True if queue has pending actions
 */
export const hasPendingActions = async (): Promise<boolean> => {
  const pendingActions = await getActionsByStatus('pending');
  return pendingActions.length > 0;
};

/**
 * Check if action queue has failed actions
 * @returns True if queue has failed actions
 */
export const hasFailedActions = async (): Promise<boolean> => {
  const failedActions = await getActionsByStatus('failed');
  return failedActions.length > 0;
};

/**
 * Map SyncQueueItem to QueuedAction
 */
const mapSyncItemToQueuedAction = (item: SyncQueueItem): QueuedAction => {
  // Map status
  let status: ActionStatus = item.status as ActionStatus;
  if (item.status === 'pending' && item.retries === 0) {
    status = 'pending';
  } else if (item.status === 'syncing') {
    status = 'syncing';
  } else if (item.status === 'failed') {
    status = 'failed';
  }

  return {
    id: item.id,
    type: item.type,
    resource: item.resource,
    resourceId: item.resourceId,
    data: item.data,
    status,
    timestamp: item.timestamp,
    retries: item.retries,
    maxRetries: item.maxRetries,
    error: item.error,
    metadata: (item as any).metadata,
  };
};

/**
 * Export all action queue functions
 */
export default {
  queueAction,
  getAction,
  getAllActions,
  getActionsByStatus,
  getActionsByResource,
  updateActionStatus,
  removeAction,
  clearCompletedActions,
  clearFailedActions,
  retryAction,
  retryAllFailedActions,
  getActionQueueStats,
  isQueueEmpty,
  hasPendingActions,
  hasFailedActions,
};
