import { apiClient } from './client';

/**
 * Notification Service
 * Handles notification-related API calls
 */

export interface NotificationPreference {
  id: string;
  userId: string;
  examResultsNotification: boolean;
  examRemindersNotification: boolean;
  messageNotifications: boolean;
  feeNotifications: boolean;
  attendanceNotifications: boolean;
  announcementNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceUpdate {
  examResultsNotification?: boolean;
  examRemindersNotification?: boolean;
  messageNotifications?: boolean;
  feeNotifications?: boolean;
  attendanceNotifications?: boolean;
  announcementNotifications?: boolean;
}

export interface PushNotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const notificationService = {
  /**
   * Get user's notification preferences
   */
  getNotificationPreferences: async (): Promise<NotificationPreference> => {
    const response = await apiClient.get<NotificationPreference>(
      '/notifications/preferences'
    );
    return response.data;
  },

  /**
   * Update user's notification preferences
   */
  updateNotificationPreferences: async (
    preferences: NotificationPreferenceUpdate
  ): Promise<NotificationPreference> => {
    const response = await apiClient.put<NotificationPreference>(
      '/notifications/preferences',
      preferences
    );
    return response.data;
  },

  /**
   * Subscribe to push notifications
   */
  subscribeToPushNotifications: async (
    subscription: PushNotificationSubscription
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/notifications/push/subscribe',
      subscription
    );
    return response.data;
  },

  /**
   * Unsubscribe from push notifications
   */
  unsubscribeFromPushNotifications: async (
    endpoint: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/notifications/push/unsubscribe',
      { endpoint }
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/notifications/${notificationId}/read`,
      {}
    );
    return response.data;
  },

  /**
   * Get user's notifications
   */
  getNotifications: async (params?: {
    type?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: any[]; total: number }> => {
    const response = await apiClient.get<{ notifications: any[]; total: number }>(
      '/notifications',
      { params }
    );
    return response.data;
  },
};

export default notificationService;
