import { create } from 'zustand';
import type { SocketNotification } from '@services/socket/socketService';

export interface AppNotification extends SocketNotification {
  id: string;
  isRead: boolean;
}

// Grouped notification per sender for message-type notifications
export interface GroupedMessageNotification {
  senderId: string;
  senderName: string;
  count: number;
  latestMessage: string;
  latestTime: Date;
  isRead: boolean;
  notifications: AppNotification[];
}

interface NotificationState {
  notifications: AppNotification[];
  unreadMessageCount: number;

  // Actions
  addNotification: (notification: SocketNotification) => void;
  markSenderRead: (senderId: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  setUnreadMessageCount: (count: number) => void;
  clearMessageNotificationsFromSender: (senderId: string) => void;

  // Derived: grouped message notifications
  getGroupedMessageNotifications: () => GroupedMessageNotification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadMessageCount: 0,

  addNotification: (notification) => {
    set((state) => {
      const messageId =
        notification.type === 'message' &&
        notification.data &&
        typeof notification.data === 'object' &&
        '_id' in notification.data &&
        typeof notification.data._id === 'string'
          ? notification.data._id
          : undefined;

      if (
        messageId &&
        state.notifications.some(
          (existing) =>
            existing.type === 'message' &&
            existing.data &&
            typeof existing.data === 'object' &&
            '_id' in existing.data &&
            existing.data._id === messageId
        )
      ) {
        return state;
      }

      const newNotification: AppNotification = {
        ...notification,
        id: messageId ?? `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isRead: false,
      };
      return {
        notifications: [newNotification, ...state.notifications].slice(0, 200),
      };
    });
  },

  markSenderRead: (senderId: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) => {
        if (n.type !== 'message' || n.isRead) return n;
        const data = n.data as any;
        const nSenderId = data?.senderId?._id ?? data?.senderId?.id ?? data?.senderId;
        return nSenderId === senderId ? { ...n, isRead: true } : n;
      }),
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setUnreadMessageCount: (count) => {
    set({ unreadMessageCount: count });
  },

  clearMessageNotificationsFromSender: (senderId: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) => {
        if (n.type !== 'message' || n.isRead) return n;
        const data = n.data as any;
        const nSenderId = data?.senderId?._id ?? data?.senderId?.id ?? data?.senderId;
        return nSenderId === senderId ? { ...n, isRead: true } : n;
      }),
    }));
  },

  getGroupedMessageNotifications: () => {
    const { notifications } = get();
    const unreadMessages = notifications.filter((n) => n.type === 'message' && !n.isRead);
    const groupMap = new Map<string, GroupedMessageNotification>();

    unreadMessages.forEach((n) => {
      const data = n.data as any;
      const senderId = data?.senderId?._id ?? data?.senderId?.id ?? data?.senderId ?? 'unknown';
      const firstname = data?.senderId?.firstname ?? '';
      const lastname = data?.senderId?.lastname ?? '';
      const senderName = `${firstname} ${lastname}`.trim() || 'Unknown';
      const content = data?.content ?? n.message ?? '';

      if (!groupMap.has(senderId)) {
        groupMap.set(senderId, {
          senderId,
          senderName,
          count: 1,
          latestMessage: content,
          latestTime: new Date(n.createdAt),
          isRead: false,
          notifications: [n],
        });
      } else {
        const group = groupMap.get(senderId)!;
        group.count += 1;
        group.notifications.push(n);
        const t = new Date(n.createdAt);
        if (t > group.latestTime) {
          group.latestTime = t;
          group.latestMessage = content;
        }
      }
    });

    return Array.from(groupMap.values()).sort(
      (a, b) => b.latestTime.getTime() - a.latestTime.getTime()
    );
  },
}));

export default useNotificationStore;
