/**
 * useActionQueue Hook
 * React hook for managing offline action queue
 */

import { useState, useEffect, useCallback } from 'react';
import {
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
  QueuedAction,
  ActionQueueStats,
  ActionStatus,
} from '@/services/offline/actionQueue';
import { useOfflineStore } from '@/store/offlineStore';

/**
 * useActionQueue hook return type
 */
export interface UseActionQueueReturn {
  // State
  actions: QueuedAction[];
  stats: ActionQueueStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  queue: (
    type: 'create' | 'update' | 'delete',
    resource: string,
    data: unknown,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ) => Promise<string>;
  getById: (actionId: string) => Promise<QueuedAction | undefined>;
  getByStatus: (status: ActionStatus) => Promise<QueuedAction[]>;
  getByResource: (resource: string) => Promise<QueuedAction[]>;
  updateStatus: (actionId: string, status: ActionStatus, error?: string) => Promise<void>;
  remove: (actionId: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  clearFailed: () => Promise<void>;
  retry: (actionId: string) => Promise<void>;
  retryAllFailed: () => Promise<void>;
  refresh: () => Promise<void>;

  // Utilities
  isEmpty: boolean;
  hasPending: boolean;
  hasFailed: boolean;
}

/**
 * useActionQueue hook options
 */
export interface UseActionQueueOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filterStatus?: ActionStatus;
  filterResource?: string;
}

/**
 * useActionQueue hook
 * @param options - Hook options
 * @returns Action queue state and methods
 */
export const useActionQueue = (options: UseActionQueueOptions = {}): UseActionQueueReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 5000,
    filterStatus,
    filterResource,
  } = options;

  const [actions, setActions] = useState<QueuedAction[]>([]);
  const [stats, setStats] = useState<ActionQueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasPending, setHasPending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  // Get offline store state
  const { isOnline, syncStatus } = useOfflineStore();

  /**
   * Load actions from queue
   */
  const loadActions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let loadedActions: QueuedAction[] = [];

      // Apply filters
      if (filterStatus) {
        loadedActions = await getActionsByStatus(filterStatus);
      } else if (filterResource) {
        loadedActions = await getActionsByResource(filterResource);
      } else {
        loadedActions = await getAllActions();
      }

      setActions(loadedActions);

      // Load stats
      const queueStats = await getActionQueueStats();
      setStats(queueStats);

      // Update utilities
      setIsEmpty(await isQueueEmpty());
      setHasPending(await hasPendingActions());
      setHasFailed(await hasFailedActions());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load actions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterResource]);

  /**
   * Queue an action
   */
  const queue = useCallback(
    async (
      type: 'create' | 'update' | 'delete',
      resource: string,
      data: unknown,
      resourceId?: string,
      metadata?: Record<string, unknown>
    ): Promise<string> => {
      try {
        const actionId = await queueAction(type, resource, data, resourceId, metadata);
        await loadActions();
        return actionId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to queue action';
        setError(errorMessage);
        throw err;
      }
    },
    [loadActions]
  );

  /**
   * Get action by ID
   */
  const getById = useCallback(async (actionId: string): Promise<QueuedAction | undefined> => {
    try {
      return await getAction(actionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get action';
      setError(errorMessage);
      return undefined;
    }
  }, []);

  /**
   * Get actions by status
   */
  const getByStatus = useCallback(async (status: ActionStatus): Promise<QueuedAction[]> => {
    try {
      return await getActionsByStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get actions';
      setError(errorMessage);
      return [];
    }
  }, []);

  /**
   * Get actions by resource
   */
  const getByResource = useCallback(async (resource: string): Promise<QueuedAction[]> => {
    try {
      return await getActionsByResource(resource);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get actions';
      setError(errorMessage);
      return [];
    }
  }, []);

  /**
   * Update action status
   */
  const updateStatus = useCallback(
    async (actionId: string, status: ActionStatus, errorMsg?: string): Promise<void> => {
      try {
        await updateActionStatus(actionId, status, errorMsg);
        await loadActions();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update action';
        setError(errorMessage);
        throw err;
      }
    },
    [loadActions]
  );

  /**
   * Remove action
   */
  const remove = useCallback(
    async (actionId: string): Promise<void> => {
      try {
        await removeAction(actionId);
        await loadActions();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove action';
        setError(errorMessage);
        throw err;
      }
    },
    [loadActions]
  );

  /**
   * Clear completed actions
   */
  const clearCompleted = useCallback(async (): Promise<void> => {
    try {
      await clearCompletedActions();
      await loadActions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear completed';
      setError(errorMessage);
      throw err;
    }
  }, [loadActions]);

  /**
   * Clear failed actions
   */
  const clearFailed = useCallback(async (): Promise<void> => {
    try {
      await clearFailedActions();
      await loadActions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear failed';
      setError(errorMessage);
      throw err;
    }
  }, [loadActions]);

  /**
   * Retry action
   */
  const retry = useCallback(
    async (actionId: string): Promise<void> => {
      try {
        await retryAction(actionId);
        await loadActions();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to retry action';
        setError(errorMessage);
        throw err;
      }
    },
    [loadActions]
  );

  /**
   * Retry all failed actions
   */
  const retryAllFailed = useCallback(async (): Promise<void> => {
    try {
      await retryAllFailedActions();
      await loadActions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry all';
      setError(errorMessage);
      throw err;
    }
  }, [loadActions]);

  /**
   * Refresh actions
   */
  const refresh = useCallback(async (): Promise<void> => {
    await loadActions();
  }, [loadActions]);

  // Initial load
  useEffect(() => {
    loadActions();
  }, [loadActions]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadActions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadActions]);

  // Refresh on sync status change
  useEffect(() => {
    if (syncStatus === 'idle') {
      loadActions();
    }
  }, [syncStatus, loadActions]);

  return {
    // State
    actions,
    stats,
    isLoading,
    error,

    // Actions
    queue,
    getById,
    getByStatus,
    getByResource,
    updateStatus,
    remove,
    clearCompleted,
    clearFailed,
    retry,
    retryAllFailed,
    refresh,

    // Utilities
    isEmpty,
    hasPending,
    hasFailed,
  };
};

export default useActionQueue;
