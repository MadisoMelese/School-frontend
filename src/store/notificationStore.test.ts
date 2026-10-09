import { beforeEach, describe, expect, it } from 'vitest';
import { useNotificationStore } from './notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.getState().clearNotifications();
    useNotificationStore.getState().setUnreadMessageCount(0);
  });

  it('does not add the same message twice when live and inbox data overlap', () => {
    const message = {
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
    };
    const notification = {
      type: 'message' as const,
      title: 'New Message',
      message: message.content,
      data: message,
      createdAt: new Date(message.createdAt),
    };

    useNotificationStore.getState().addNotification(notification);
    useNotificationStore.getState().addNotification(notification);

    expect(useNotificationStore.getState().notifications).toHaveLength(1);
    expect(useNotificationStore.getState().getGroupedMessageNotifications()).toMatchObject([
      { senderId: 'sender-1', senderName: 'Jane Teacher', count: 1 },
    ]);
  });
});
