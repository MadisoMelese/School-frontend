import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Card } from '@components/molecules/Card';
import { Icon } from '@components/atoms/Icon';
import { Spinner } from '@components/atoms/Spinner';
import { useUIStore } from '@store/uiStore';
import {
  notificationService,
  type NotificationPreference,
} from '@services/api/notificationService';

/**
 * Notification Preferences Page
 * Allows users to configure notification settings
 * - Enable/disable exam result notifications
 * - Enable/disable exam reminder notifications
 * - Enable/disable message notifications
 * - Enable/disable fee notifications
 * - Enable/disable attendance notifications
 * - Enable/disable announcement notifications
 * - Manage push notification subscriptions
 */

export const NotificationPreferencesPage: React.FC = () => {
  const addNotification = useUIStore((state) => state.addNotification);

  // State
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const prefs = await notificationService.getNotificationPreferences();
        setPreferences(prefs);

        // Check if push notifications are supported and enabled
        if ('serviceWorker' in navigator && 'Notification' in window) {
          const registration = await navigator.serviceWorker.ready;
          if (registration.pushManager) {
            const subscription = await registration.pushManager.getSubscription();
            setPushNotificationEnabled(!!subscription);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Handle preference change
  const handlePreferenceChange = async (key: keyof NotificationPreference, value: boolean) => {
    if (!preferences) return;

    try {
      setSaving(true);
      const updated = await notificationService.updateNotificationPreferences({
        [key]: value,
      });
      setPreferences(updated);
      addNotification({
        type: 'success',
        message: 'Notification preferences updated',
        duration: 3000,
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update preferences',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle push notification toggle
  const handlePushNotificationToggle = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('Notification' in window)) {
        addNotification({
          type: 'error',
          message: 'Push notifications are not supported in your browser',
          duration: 5000,
        });
        return;
      }

      // Request permission if needed
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          addNotification({
            type: 'error',
            message: 'Push notification permission denied',
            duration: 5000,
          });
          return;
        }
      }

      if (Notification.permission !== 'granted') {
        addNotification({
          type: 'error',
          message:
            'Push notifications are not enabled. Please enable them in your browser settings.',
          duration: 5000,
        });
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) {
        addNotification({
          type: 'error',
          message: 'Push notifications are not available',
          duration: 5000,
        });
        return;
      }

      if (pushNotificationEnabled) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await notificationService.unsubscribeFromPushNotifications(subscription.endpoint);
          setPushNotificationEnabled(false);
          addNotification({
            type: 'success',
            message: 'Push notifications disabled',
            duration: 3000,
          });
        }
      } else {
        // Subscribe
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
        });

        await notificationService.subscribeToPushNotifications({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey('p256dh') || []) as any
              )
            ),
            auth: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey('auth') || []) as any
              )
            ),
          },
        });

        setPushNotificationEnabled(true);
        addNotification({
          type: 'success',
          message: 'Push notifications enabled',
          duration: 3000,
        });
      }
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update push notifications',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Notification Preferences"
        description="Manage your notification settings"
      >
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !preferences) {
    return (
      <DashboardLayout
        title="Notification Preferences"
        description="Manage your notification settings"
      >
        <Card>
          <div className="text-center py-8">
            <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
            <p className="text-danger-600 font-medium">{error || 'Failed to load preferences'}</p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Notification Preferences"
      description="Manage your notification settings"
    >
      <div className="space-y-6 max-w-2xl">
        {/* Push Notifications */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900">Push Notifications</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Receive notifications even when the app is closed
                </p>
              </div>
              <button
                onClick={handlePushNotificationToggle}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushNotificationEnabled ? 'bg-primary-600' : 'bg-neutral-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={pushNotificationEnabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushNotificationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Notification Types */}
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900">Notification Types</h3>

            {/* Exam Results */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0">
              <div>
                <p className="font-medium text-neutral-900">Exam Results</p>
                <p className="text-sm text-neutral-600">
                  Get notified when your exam results are published
                </p>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange(
                    'examResultsNotification',
                    !preferences.examResultsNotification
                  )
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.examResultsNotification ? 'bg-primary-600' : 'bg-neutral-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={preferences.examResultsNotification}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.examResultsNotification ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Exam Reminders */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0">
              <div>
                <p className="font-medium text-neutral-900">Exam Reminders</p>
                <p className="text-sm text-neutral-600">Get reminded when an exam is coming up</p>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange(
                    'examRemindersNotification',
                    !preferences.examRemindersNotification
                  )
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.examRemindersNotification ? 'bg-primary-600' : 'bg-neutral-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={preferences.examRemindersNotification}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.examRemindersNotification ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Messages */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0">
              <div>
                <p className="font-medium text-neutral-900">Messages</p>
                <p className="text-sm text-neutral-600">
                  Get notified when you receive a new message
                </p>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange('messageNotifications', !preferences.messageNotifications)
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.messageNotifications ? 'bg-primary-600' : 'bg-neutral-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={preferences.messageNotifications}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.messageNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Fees */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0">
              <div>
                <p className="font-medium text-neutral-900">Fees</p>
                <p className="text-sm text-neutral-600">
                  Get notified about fee payments and overdue fees
                </p>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange('feeNotifications', !preferences.feeNotifications)
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.feeNotifications ? 'bg-primary-600' : 'bg-neutral-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={preferences.feeNotifications}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.feeNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Attendance */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0">
              <div>
                <p className="font-medium text-neutral-900">Attendance</p>
                <p className="text-sm text-neutral-600">Get notified when attendance is marked</p>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange(
                    'attendanceNotifications',
                    !preferences.attendanceNotifications
                  )
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.attendanceNotifications ? 'bg-primary-600' : 'bg-neutral-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={preferences.attendanceNotifications}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.attendanceNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Announcements */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-neutral-900">Announcements</p>
                <p className="text-sm text-neutral-600">Get notified about new announcements</p>
              </div>
              <button
                onClick={() =>
                  handlePreferenceChange(
                    'announcementNotifications',
                    !preferences.announcementNotifications
                  )
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.announcementNotifications ? 'bg-primary-600' : 'bg-neutral-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="switch"
                aria-checked={preferences.announcementNotifications}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.announcementNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card className="bg-primary-50 border border-primary-200">
          <div className="flex gap-3">
            <Icon name="Info" size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary-900 font-medium">
                Notification preferences are saved automatically
              </p>
              <p className="text-sm text-primary-800 mt-1">
                You can change these settings at any time. Push notifications require your browser
                permission.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NotificationPreferencesPage;
