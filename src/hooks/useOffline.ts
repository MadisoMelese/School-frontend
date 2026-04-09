import { useOfflineStore } from '@/store/offlineStore';

/**
 * useOffline Hook
 * Provides access to offline state and sync status
 */
export const useOffline = () => {
  const {
    isOnline,
    setOnline,
    syncStatus,
    setSyncStatus,
    pendingActions,
    addPendingAction,
    removePendingAction,
    updatePendingAction,
    getPendingActions,
    clearPendingActions,
    syncError,
    setSyncError,
    getPendingActionCount,
  } = useOfflineStore();

  return {
    isOnline,
    setOnline,
    syncStatus,
    setSyncStatus,
    pendingActions,
    addPendingAction,
    removePendingAction,
    updatePendingAction,
    getPendingActions,
    clearPendingActions,
    syncError,
    setSyncError,
    getPendingActionCount,
  };
};

export default useOffline;
