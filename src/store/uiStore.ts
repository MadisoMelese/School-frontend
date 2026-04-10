import { create } from 'zustand';

/**
 * UI Store
 * Manages UI state: theme, sidebar, modals, notifications
 */

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // in milliseconds, 0 = persistent
}

export interface Modal {
  id: string;
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

export interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Modals
  modals: Record<string, Modal>;
  openModal: (id: string, title?: string, content?: React.ReactNode) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Service Worker Update
  serviceWorkerUpdateAvailable: boolean;
  setServiceWorkerUpdateAvailable: (available: boolean) => void;
  serviceWorkerOfflineReady: boolean;
  setServiceWorkerOfflineReady: (ready: boolean) => void;
}

export const useUIStore = create<UIState>((set) => {
  // Apply theme on initialization
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const theme = savedTheme || 'system';
    applyTheme(theme);
    return theme;
  };

  return {
    // Theme
    theme: initializeTheme(),

    setTheme: (theme: 'light' | 'dark' | 'system') => {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      set({ theme });
    },

    // Sidebar
    sidebarOpen: true,

    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },

    setSidebarOpen: (open: boolean) => {
      set({ sidebarOpen: open });
    },

    // Notifications
    notifications: [],

    addNotification: (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const newNotification: Notification = { ...notification, id };

      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }));

      // Auto-remove notification if duration is set
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        }, notification.duration);
      }

      return id;
    },

    removeNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },

    clearNotifications: () => {
      set({ notifications: [] });
    },

    // Modals
    modals: {},

    openModal: (id: string, title?: string, content?: React.ReactNode) => {
      set((state) => ({
        modals: {
          ...state.modals,
          [id]: {
            id,
            isOpen: true,
            title,
            content,
          },
        },
      }));
    },

    closeModal: (id: string) => {
      set((state) => ({
        modals: {
          ...state.modals,
          [id]: {
            ...state.modals[id],
            isOpen: false,
          },
        },
      }));
    },

    closeAllModals: () => {
      set((state) => {
        const updatedModals: Record<string, Modal> = {};
        Object.keys(state.modals).forEach((key) => {
          updatedModals[key] = {
            ...state.modals[key],
            isOpen: false,
          };
        });
        return { modals: updatedModals };
      });
    },

    // Service Worker Update
    serviceWorkerUpdateAvailable: false,

    setServiceWorkerUpdateAvailable: (available: boolean) => {
      set({ serviceWorkerUpdateAvailable: available });
    },

    serviceWorkerOfflineReady: false,

    setServiceWorkerOfflineReady: (ready: boolean) => {
      set({ serviceWorkerOfflineReady: ready });
    },
  };
});

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default useUIStore;
