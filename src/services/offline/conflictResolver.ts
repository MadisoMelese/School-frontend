import { setItem, getItem, deleteItem, getAllItems } from './indexedDB';

/**
 * Conflict Log Entry
 */
export interface ConflictLogEntry {
  id: string;
  resource: string;
  resourceId: string;
  localVersion: unknown;
  remoteVersion: unknown;
  timestamp: number;
  resolved: boolean;
  resolution: 'local' | 'remote' | 'merged' | null;
}

const STORE_NAME = 'conflictLog';

/**
 * Log conflict
 */
export const logConflict = async (
  resource: string,
  resourceId: string,
  localVersion: unknown,
  remoteVersion: unknown
): Promise<string> => {
  const id = `conflict-${Date.now()}-${Math.random()}`;

  const entry: ConflictLogEntry = {
    id,
    resource,
    resourceId,
    localVersion,
    remoteVersion,
    timestamp: Date.now(),
    resolved: false,
    resolution: null,
  };

  await setItem(STORE_NAME, id, entry as unknown as Record<string, unknown>);
  return id;
};

/**
 * Get unresolved conflicts
 */
export const getUnresolvedConflicts = async (): Promise<ConflictLogEntry[]> => {
  const allEntries = await getAllItems(STORE_NAME);
  return allEntries.filter((entry) => !(entry as unknown as ConflictLogEntry).resolved) as unknown as ConflictLogEntry[];
};

/**
 * Get conflict by ID
 */
export const getConflict = async (id: string): Promise<ConflictLogEntry | undefined> => {
  const entry = await getItem(STORE_NAME, id);
  return entry as ConflictLogEntry | undefined;
};

/**
 * Resolve conflict (use local version)
 */
export const resolveConflictLocal = async (id: string): Promise<void> => {
  const entry = await getConflict(id);

  if (!entry) return;

  const resolvedEntry: ConflictLogEntry = {
    ...entry,
    resolved: true,
    resolution: 'local',
  };

  await setItem(STORE_NAME, id, resolvedEntry as unknown as Record<string, unknown>);
};

/**
 * Resolve conflict (use remote version)
 */
export const resolveConflictRemote = async (id: string): Promise<void> => {
  const entry = await getConflict(id);

  if (!entry) return;

  const resolvedEntry: ConflictLogEntry = {
    ...entry,
    resolved: true,
    resolution: 'remote',
  };

  await setItem(STORE_NAME, id, resolvedEntry as unknown as Record<string, unknown>);
};

/**
 * Resolve conflict (merge versions)
 */
export const resolveConflictMerged = async (id: string): Promise<void> => {
  const entry = await getConflict(id);

  if (!entry) return;

  const resolvedEntry: ConflictLogEntry = {
    ...entry,
    resolved: true,
    resolution: 'merged',
  };

  await setItem(STORE_NAME, id, resolvedEntry as unknown as Record<string, unknown>);
};

/**
 * Get conflicts by resource
 */
export const getConflictsByResource = async (resource: string): Promise<ConflictLogEntry[]> => {
  const allEntries = await getAllItems(STORE_NAME);
  return allEntries.filter((entry) => (entry as unknown as ConflictLogEntry).resource === resource) as unknown as ConflictLogEntry[];
};

/**
 * Get conflicts by resource ID
 */
export const getConflictsByResourceId = async (
  resource: string,
  resourceId: string
): Promise<ConflictLogEntry[]> => {
  const allEntries = await getAllItems(STORE_NAME);
  return allEntries.filter(
    (entry) => (entry as unknown as ConflictLogEntry).resource === resource && (entry as unknown as ConflictLogEntry).resourceId === resourceId
  ) as unknown as ConflictLogEntry[];
};

/**
 * Clear resolved conflicts
 */
export const clearResolvedConflicts = async (): Promise<void> => {
  const allEntries = await getAllItems(STORE_NAME);

  for (const entry of allEntries) {
    if ((entry as unknown as ConflictLogEntry).resolved) {
      await deleteItem(STORE_NAME, (entry as unknown as ConflictLogEntry).id);
    }
  }
};

/**
 * Clear all conflicts
 */
export const clearAllConflicts = async (): Promise<void> => {
  const allEntries = await getAllItems(STORE_NAME);

  for (const entry of allEntries) {
    await deleteItem(STORE_NAME, (entry as unknown as ConflictLogEntry).id);
  }
};

/**
 * Detect conflicts between local and remote data
 */
export const detectConflicts = async (
  resource: string,
  localData: Record<string, unknown>,
  remoteData: Record<string, unknown>
): Promise<string[]> => {
  const conflictIds: string[] = [];

  for (const [key, localValue] of Object.entries(localData)) {
    const remoteValue = remoteData[key];

    if (remoteValue !== undefined && JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
      const conflictId = await logConflict(resource, key, localValue, remoteValue);
      conflictIds.push(conflictId);
    }
  }

  return conflictIds;
};

/**
 * Merge conflicting versions (simple strategy: prefer remote)
 */
export const mergeVersions = (
  localVersion: Record<string, unknown>,
  remoteVersion: Record<string, unknown>
): Record<string, unknown> => {
  return {
    ...localVersion,
    ...remoteVersion,
    // Timestamp is always from remote (server is source of truth)
    updatedAt: remoteVersion.updatedAt,
  };
};

export default {
  logConflict,
  getUnresolvedConflicts,
  getConflict,
  resolveConflictLocal,
  resolveConflictRemote,
  resolveConflictMerged,
  getConflictsByResource,
  getConflictsByResourceId,
  clearResolvedConflicts,
  clearAllConflicts,
  detectConflicts,
  mergeVersions,
};
