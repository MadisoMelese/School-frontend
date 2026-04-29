import { create } from 'zustand';
import type { SocketNotification } from '@services/socket/socketService';

export interface AppNotification extends SocketNotification {
  id: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadMessageCount: number;
  unreadNotificationCount: number;

  // Actions
  addNotification: (notification: SocketNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  setUnreadMessageCount: (count: number) => void;
  incrementUnreadMessageCount: () => void;
  decrementUnreadMessageCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadMessageCount: 0,
  unreadNotificationCount: 0,

  addNotification: (notification) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadNotificationCount: state.unreadNotificationCount + 1,
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadNotificationCount: Math.max(
        0,
        state.unreadNotificationCount -
          (state.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0)
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadNotificationCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadNotificationCount: 0 });
  },

  setUnreadMessageCount: (count) => {
    set({ unreadMessageCount: count });
  },

  incrementUnreadMessageCount: () => {
    set((state) => ({ unreadMessageCount: state.unreadMessageCount + 1 }));
  },

  decrementUnreadMessageCount: () => {
    set((state) => ({
      unreadMessageCount: Math.max(0, state.unreadMessageCount - 1),
    }));
  },
}));

export default useNotificationStore;
