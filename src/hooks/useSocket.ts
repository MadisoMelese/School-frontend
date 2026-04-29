import { useEffect, useRef } from 'react';
import { useAuthStore } from '@store/authStore';
import socketService from '@services/socket/socketService';

/**
 * useSocket
 * Manages Socket.IO connection lifecycle tied to authentication state.
 * Connects when authenticated, disconnects on logout.
 */
export const useSocket = () => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && accessToken && !connectedRef.current) {
      socketService.connect();
      connectedRef.current = true;
    }

    if (!isAuthenticated && connectedRef.current) {
      socketService.disconnect();
      connectedRef.current = false;
    }

    return () => {
      // Don't disconnect on component unmount — only on logout
    };
  }, [isAuthenticated, accessToken]);

  return socketService;
};

export default useSocket;
