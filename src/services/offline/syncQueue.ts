import { setItem, getItem, deleteItem, getAllItems } from './indexedDB';

/**
 * Sync Queue Item
 */
export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  resourceId?: string;
  data: unknown;
  status: 'pending' | 'syncing' | 'failed';
  retries: number;
  maxRetries: number;
  timestamp: number;
  error?: string;
}

const STORE_NAME = 'syncQueue';
const MAX_RETRIES = 3;

/**
 * Add action to sync queue
 */
export const addToSyncQueue = async (
  type: 'create' | 'update' | 'delete',
  resource: string,
  data: unknown,
  resourceId?: string
): Promise<string> => {
  const id = `sync-${Date.now()}-${Math.random()}`;

  const item: SyncQueueItem = {
    id,
    type,
    resource,
    resourceId,
    data,
    status: 'pending',
    retries: 0,
    maxRetries: MAX_RETRIES,
    timestamp: Date.now(),
  };

  await setItem(STORE_NAME, id, item as unknown as Record<string, unknown>);
  return id;
};

/**
 * Get pending sync items
 */
export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  const allItems = await getAllItems(STORE_NAME);
  return allItems.filter(
    (item) => (item as unknown as SyncQueueItem).status === 'pending'
  ) as unknown as SyncQueueItem[];
};

/**
 * Get sync item by ID
 */
export const getSyncItem = async (id: string): Promise<SyncQueueItem | undefined> => {
  const item = await getItem(STORE_NAME, id);
  return item as SyncQueueItem | undefined;
};

/**
 * Update sync item status
 */
export const updateSyncItemStatus = async (
  id: string,
  status: 'pending' | 'syncing' | 'failed',
  error?: string
): Promise<void> => {
  const item = await getSyncItem(id);

  if (!item) return;

  const updatedItem: SyncQueueItem = {
    ...item,
    status,
    error,
  };

  await setItem(STORE_NAME, id, updatedItem as unknown as Record<string, unknown>);
};

/**
 * Increment retry count
 */
export const incrementRetryCount = async (id: string): Promise<void> => {
  const item = await getSyncItem(id);

  if (!item) return;

  const updatedItem: SyncQueueItem = {
    ...item,
    retries: item.retries + 1,
  };

  await setItem(STORE_NAME, id, updatedItem as unknown as Record<string, unknown>);
};

/**
 * Remove sync item
 */
export const removeSyncItem = async (id: string): Promise<void> => {
  await deleteItem(STORE_NAME, id);
};

/**
 * Get all sync items
 */
export const getAllSyncItems = async (): Promise<SyncQueueItem[]> => {
  const allItems = await getAllItems(STORE_NAME);
  return allItems as unknown as SyncQueueItem[];
};

/**
 * Clear sync queue
 */
export const clearSyncQueue = async (): Promise<void> => {
  const allItems = await getAllSyncItems();

  for (const item of allItems) {
    await removeSyncItem(item.id);
  }
};

/**
 * Get failed sync items
 */
export const getFailedSyncItems = async (): Promise<SyncQueueItem[]> => {
  const allItems = await getAllItems(STORE_NAME);
  return allItems.filter(
    (item) => (item as unknown as SyncQueueItem).status === 'failed'
  ) as unknown as SyncQueueItem[];
};

/**
 * Get sync items by resource
 */
export const getSyncItemsByResource = async (resource: string): Promise<SyncQueueItem[]> => {
  const allItems = await getAllItems(STORE_NAME);
  return allItems.filter(
    (item) => (item as unknown as SyncQueueItem).resource === resource
  ) as unknown as SyncQueueItem[];
};

/**
 * Get sync queue count
 */
export const getSyncQueueCount = async (): Promise<number> => {
  const allItems = await getAllItems(STORE_NAME);
  return allItems.length;
};

/**
 * Get pending sync count
 */
export const getPendingSyncCount = async (): Promise<number> => {
  const pendingItems = await getPendingSyncItems();
  return pendingItems.length;
};

/**
 * Check if item can be retried
 */
export const canRetry = async (id: string): Promise<boolean> => {
  const item = await getSyncItem(id);

  if (!item) return false;

  return item.retries < item.maxRetries;
};

export default {
  addToSyncQueue,
  getPendingSyncItems,
  getSyncItem,
  updateSyncItemStatus,
  incrementRetryCount,
  removeSyncItem,
  getAllSyncItems,
  clearSyncQueue,
  getFailedSyncItems,
  getSyncItemsByResource,
  getSyncQueueCount,
  getPendingSyncCount,
  canRetry,
};
