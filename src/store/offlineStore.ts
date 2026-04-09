import { create } from 'zustand';

/**
 * Offline Store
 * Manages offline state, sync status, and pending actions
 */

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  resourceId?: string;
  data: unknown;
  timestamp: number;
  retries: number;
}

export interface OfflineState {
  // Online/Offline status
  isOnline: boolean;
  setOnline: (online: boolean) => void;

  // Sync status
  syncStatus: 'idle' | 'syncing' | 'error';
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;

  // Pending actions
  pendingActions: PendingAction[];
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => string;
  removePendingAction: (id: string) => void;
  updatePendingAction: (id: string, updates: Partial<PendingAction>) => void;
  getPendingActions: () => PendingAction[];
  clearPendingActions: () => void;

  // Sync error
  syncError: string | null;
  setSyncError: (error: string | null) => void;

  // Sync count
  getPendingActionCount: () => number;
}

export const useOfflineStore = create<OfflineState>((set, get) => {
  // Listen to online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      set({ isOnline: true, syncStatus: 'idle' });
    });

    window.addEventListener('offline', () => {
      set({ isOnline: false });
    });
  }

  return {
    // Online/Offline status
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

    setOnline: (online: boolean) => {
      set({ isOnline: online });
      if (online) {
        set({ syncStatus: 'idle' });
      }
    },

    // Sync status
    syncStatus: 'idle',

    setSyncStatus: (status: 'idle' | 'syncing' | 'error') => {
      set({ syncStatus: status });
    },

    // Pending actions
    pendingActions: [],

    addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => {
      const id = `action-${Date.now()}-${Math.random()}`;
      const newAction: PendingAction = {
        ...action,
        id,
        timestamp: Date.now(),
        retries: 0,
      };

      set((state) => ({
        pendingActions: [...state.pendingActions, newAction],
      }));

      return id;
    },

    removePendingAction: (id: string)  => {
      set((state) => ({
        pendingActions: state.pendingActions.filter((action) => action.id !== id),
      }));
    },

    updatePendingAction: (id: string, updates: Partial<PendingAction>) => {
      set((state) => ({
        pendingActions: state.pendingActions.map((action) =>
          action.id === id ? { ...action, ...updates } : action
        ),
      }));
    },

    getPendingActions: () => {
      return get().pendingActions;
    },

    clearPendingActions: () => {
      set({ pendingActions: [] });
    },

    // Sync error
    syncError: null,

    setSyncError: (error: string | null) => {
      set({ syncError: error });
      if (error) {
        set({ syncStatus: 'error' });
      }
    },

    // Sync count
    getPendingActionCount: () => {
      return get().pendingActions.length;
    },
  };
});

export default useOfflineStore;
