import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { apiClient } from '@services/api/client';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';
import socketService from '@services/socket/socketService';
import { RealtimeProvider } from './RealtimeProvider';

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock('@services/socket/socketService', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    onNewMessage: vi.fn(() => vi.fn()),
    onNotification: vi.fn(() => vi.fn()),
    onUnreadCountUpdate: vi.fn(() => vi.fn()),
  },
}));

describe('RealtimeProvider', () => {
  let resolveInbox: ((response: never) => void) | undefined;
  let unmountProvider: (() => void) | undefined;

  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: true, accessToken: 'access-token' });
    useNotificationStore.getState().clearNotifications();
    useNotificationStore.getState().setUnreadMessageCount(0);
    vi.mocked(apiClient.get).mockReturnValue(
      new Promise((resolve) => {
        resolveInbox = resolve;
      }) as never
    );
  });

  afterEach(() => {
    unmountProvider?.();
    unmountProvider = undefined;
    useAuthStore.setState({ isAuthenticated: false, accessToken: null });
    useNotificationStore.getState().clearNotifications();
    useNotificationStore.getState().setUnreadMessageCount(0);
    vi.clearAllMocks();
  });

  it('loads existing unread messages and count and subscribes without a delay', async () => {
    const rendered = render(
      <RealtimeProvider>
        <div>App</div>
      </RealtimeProvider>
    );
    unmountProvider = rendered.unmount;

    expect(socketService.onNewMessage).toHaveBeenCalledOnce();
    expect(socketService.onUnreadCountUpdate).toHaveBeenCalledOnce();
    expect(apiClient.get).toHaveBeenCalledWith('/messages/inbox', {
      params: { isRead: false, limit: 200 },
    });

    await act(async () => {
      resolveInbox?.({
        data: {
          success: true,
          data: {
            messages: [
              {
                _id: 'message-1',
                senderId: {
                  _id: 'sender-1',
                  firstname: 'Jane',
                  lastname: 'Teacher',
                  email: 'jane@example.com',
                },
                receiverId: 'receiver-1',
                subject: 'Welcome',
                content: 'Hello',
                isRead: false,
                createdAt: '2026-10-09T12:00:00.000Z',
                updatedAt: '2026-10-09T12:00:00.000Z',
              },
            ],
            total: 3,
          },
        },
      } as never);
      await Promise.resolve();
    });

    expect(useNotificationStore.getState().unreadMessageCount).toBe(3);
    expect(useNotificationStore.getState().getGroupedMessageNotifications()).toMatchObject([
      { senderId: 'sender-1', senderName: 'Jane Teacher', count: 1 },
    ]);
  });
});
