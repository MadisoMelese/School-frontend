import { useEffect, useRef } from 'react';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';
import { apiClient } from '@services/api/client';
import socketService from '@services/socket/socketService';
import type { SocketMessage, SocketNotification } from '@services/socket/socketService';

/**
 * RealtimeProvider
 * Manages Socket.IO connection and listens for real-time events.
 * Must be rendered inside the authenticated app tree.
 * Does NOT render any UI — purely a side-effect component.
 */
export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const {
    addNotification,
    clearNotifications,
    setUnreadMessageCount,
  } = useNotificationStore();
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketService.disconnect();
      clearNotifications();
      setUnreadMessageCount(0);
      return;
    }

    socketService.connect();

    let active = true;
    let receivedUnreadCountUpdate = false;

    // Register listeners before loading persisted unread messages so new events
    // are not missed while the initial request is in flight.
    const offNewMessage = socketService.onNewMessage((message: SocketMessage) => {
      addNotification({
        type: 'message',
        title: 'New Message',
        message: message.content ?? '',
        data: message,
        createdAt: new Date(message.createdAt),
      });
    });

    const offNotification = socketService.onNotification((notification: SocketNotification) => {
      if (notification.type !== 'message') {
        addNotification(notification);
      }
    });

    const offUnreadCount = socketService.onUnreadCountUpdate(({ count }) => {
      receivedUnreadCountUpdate = true;
      setUnreadMessageCount(count);
    });

    cleanupRef.current = [offNewMessage, offNotification, offUnreadCount];

    void apiClient
      .get<{
        success: boolean;
        data: { messages: SocketMessage[]; total: number };
      }>('/messages/inbox', { params: { isRead: false, limit: 200 } })
      .then(({ data }) => {
        if (!active) return;
        data.data.messages.forEach((message) => {
          addNotification({
            type: 'message',
            title: 'New Message',
            message: message.content ?? '',
            data: message,
            createdAt: new Date(message.createdAt),
          });
        });
        if (!receivedUnreadCountUpdate) {
          setUnreadMessageCount(data.data.total);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error('Failed to load unread notifications:', error);
        }
      });

    return () => {
      active = false;
      cleanupRef.current.forEach((off) => off());
      cleanupRef.current = [];
    };
  }, [
    isAuthenticated,
    accessToken,
    addNotification,
    clearNotifications,
    setUnreadMessageCount,
  ]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return <>{children}</>;
};

export default RealtimeProvider;
