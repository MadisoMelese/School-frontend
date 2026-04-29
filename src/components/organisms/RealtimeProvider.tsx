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

    // Connect socket
    socketService.connect();

    // Wait a tick for connection to establish
    const setupTimeout = setTimeout(() => {
      // Listen for new messages
      const offNewMessage = socketService.onNewMessage((message: SocketMessage) => {
        addNotification({
          type: 'message',
          title: 'New Message',
          message: `${message.senderId?.firstname ?? 'Someone'} ${message.senderId?.lastname ?? ''}: ${message.subject}`,
          data: message,
          createdAt: new Date(),
        });
      });

      // Listen for notifications
      const offNotification = socketService.onNotification((notification: SocketNotification) => {
        addNotification(notification);
      });

      // Listen for unread count updates
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
