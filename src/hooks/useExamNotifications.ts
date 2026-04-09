import { useEffect, useCallback, useRef } from 'react';
import { useUIStore } from '@store/uiStore';
import { useOfflineStore } from '@store/offlineStore';
import { notificationService } from '@services/api/notificationService';
import type { Exam } from '@types';

/**
 * Hook for managing exam result notifications
 * - Detects when exam results are published
 * - Sends notifications to students
 * - Handles notification preferences
 * - Supports push notifications
 * - Queues notifications for offline sync
 */

interface ExamNotificationState {
  lastCheckedExamIds: Set<string>;
  notificationPreferences: {
    examResultsNotification: boolean;
  } | null;
}

const notificationState: ExamNotificationState = {
  lastCheckedExamIds: new Set(),
  notificationPreferences: null,
};

export const useExamNotifications = () => {
  const addNotification = useUIStore((state) => state.addNotification);
  const isOnline = useOfflineStore((state) => state.isOnline);
  const addPendingAction = useOfflineStore((state) => state.addPendingAction);
  const notificationPrefsRef = useRef<{ examResultsNotification: boolean } | null>(null);

  /**
   * Load notification preferences
   */
  const loadNotificationPreferences = useCallback(async () => {
    try {
      const prefs = await notificationService.getNotificationPreferences();
      notificationPrefsRef.current = {
        examResultsNotification: prefs.examResultsNotification,
      };
      notificationState.notificationPreferences = {
        examResultsNotification: prefs.examResultsNotification,
      };
    } catch (error) {
      // Silently fail and default to enabled if fetch fails
      // This prevents errors in tests and offline scenarios
      notificationPrefsRef.current = { examResultsNotification: true };
    }
  }, []);

  /**
   * Check if exam has results published
   */
  const hasResultsPublished = useCallback((exam: Exam): boolean => {
    return !!(exam.result && exam.result.marksObtained !== undefined);
  }, []);

  /**
   * Send exam result notification
   */
  const sendExamResultNotification = useCallback(
    async (exam: Exam) => {
      // Check if notifications are enabled
      if (notificationPrefsRef.current && !notificationPrefsRef.current.examResultsNotification) {
        return;
      }

      // Check if already notified
      if (notificationState.lastCheckedExamIds.has(exam.id)) {
        return;
      }

      // Mark as notified
      notificationState.lastCheckedExamIds.add(exam.id);

      // Prepare notification message
      const message = `Your ${exam.subject} exam results are now available!`;

      // Show toast notification
      addNotification({
        type: 'success',
        message,
        duration: 5000,
      });

      // Try to send push notification if online
      if (isOnline && 'serviceWorker' in navigator && 'Notification' in window) {
        try {
          // Request permission if not granted
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }

          // Send push notification
          if (Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            if (registration.showNotification) {
              await registration.showNotification('Exam Results Published', {
                body: message,
                icon: '/icons/exam-notification.png',
                badge: '/icons/badge.png',
                tag: `exam-result-${exam.id}`,
                requireInteraction: false,
                data: {
                  examId: exam.id,
                  url: '/student/exams',
                },
              });
            }
          }
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      }

      // Queue notification for offline sync if offline
      if (!isOnline) {
        addPendingAction({
          type: 'create',
          resource: 'notification',
          data: {
            type: 'exam_result',
            examId: exam.id,
            message,
          },
        });
      }
    },
    [addNotification, isOnline, addPendingAction]
  );

  /**
   * Check exams for new results
   */
  const checkExamsForNewResults = useCallback(
    (exams: Exam[]) => {
      exams.forEach((exam) => {
        if (hasResultsPublished(exam)) {
          sendExamResultNotification(exam);
        }
      });
    },
    [hasResultsPublished, sendExamResultNotification]
  );

  /**
   * Initialize notification preferences on mount
   */
  useEffect(() => {
    loadNotificationPreferences();
  }, [loadNotificationPreferences]);

  return {
    checkExamsForNewResults,
    sendExamResultNotification,
    loadNotificationPreferences,
  };
};

export default useExamNotifications;
