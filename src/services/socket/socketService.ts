import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@services/api/tokenManager';

const SOCKET_URL = (() => {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
  // Strip /api suffix to get the base server URL for Socket.IO
  return apiUrl.replace(/\/api\/?$/, '');
})();

export interface SocketNotification {
  type: 'message' | 'announcement' | 'grade' | 'attendance' | 'fee' | 'general';
  title: string;
  message: string;
  data?: unknown;
  createdAt: Date;
}

export interface SocketMessage {
  _id: string;
  senderId: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  receiverId: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket | null {
    const token = getAccessToken();
    if (!token) {
      console.warn('No access token available for Socket.IO connection');
      return null;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      this.reconnectAttempts++;
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Emit typing start
  emitTypingStart(receiverId: string): void {
    this.socket?.emit('typing:start', { receiverId });
  }

  // Emit typing stop
  emitTypingStop(receiverId: string): void {
    this.socket?.emit('typing:stop', { receiverId });
  }

  // Emit message read
  emitMessageRead(messageId: string): void {
    this.socket?.emit('message:read', { messageId });
  }

  // Subscribe to new messages
  onNewMessage(callback: (message: SocketMessage) => void): () => void {
    this.socket?.on('message:new', callback);
    return () => this.socket?.off('message:new', callback);
  }

  // Subscribe to notifications
  onNotification(callback: (notification: SocketNotification) => void): () => void {
    this.socket?.on('notification:new', callback);
    return () => this.socket?.off('notification:new', callback);
  }

  // Subscribe to unread count updates
  onUnreadCountUpdate(callback: (data: { count: number }) => void): () => void {
    this.socket?.on('message:unread-count', callback);
    return () => this.socket?.off('message:unread-count', callback);
  }

  // Subscribe to typing indicators
  onTypingStart(callback: (data: { senderId: string }) => void): () => void {
    this.socket?.on('typing:start', callback);
    return () => this.socket?.off('typing:start', callback);
  }

  onTypingStop(callback: (data: { senderId: string }) => void): () => void {
    this.socket?.on('typing:stop', callback);
    return () => this.socket?.off('typing:stop', callback);
  }

  // Subscribe to message read receipts
  onMessageRead(callback: (data: { messageId: string; readBy: string; readAt: Date }) => void): () => void {
    this.socket?.on('message:read', callback);
    return () => this.socket?.off('message:read', callback);
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
