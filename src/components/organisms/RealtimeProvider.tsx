import { useEffect, useRef } from 'react';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';
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
  const { addNotification, setUnreadMessageCount } = useNotificationStore();
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketService.disconnect();
      return;
    }

    socketService.connect();

    const setupTimeout = setTimeout(() => {
      // New message → add grouped notification entry
      const offNewMessage = socketService.onNewMessage((message: SocketMessage) => {
        addNotification({
          type: 'message',
          title: 'New Message',
          message: message.content ?? '',
          data: message,
          createdAt: new Date(),
        });
        // NOTE: do NOT increment unreadMessageCount here.
        // The backend emits message:unread-count right after, which is the
        // authoritative count. Using that avoids double-counting.
      });

      // Non-message notifications (announcements, grades, etc.)
      const offNotification = socketService.onNotification((notification: SocketNotification) => {
        if (notification.type !== 'message') {
          addNotification(notification);
        }
      });

      // Authoritative unread count from backend — this is the ONLY source for the badge
      const offUnreadCount = socketService.onUnreadCountUpdate(({ count }) => {
        setUnreadMessageCount(count);
      });

      cleanupRef.current = [offNewMessage, offNotification, offUnreadCount];
    }, 500);

    return () => {
      clearTimeout(setupTimeout);
      cleanupRef.current.forEach((off) => off());
      cleanupRef.current = [];
    };
  }, [isAuthenticated, accessToken, addNotification, setUnreadMessageCount]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return <>{children}</>;
};

export default RealtimeProvider;
