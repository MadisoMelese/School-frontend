import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationPreferencesPage } from './NotificationPreferencesPage';
import * as notificationService from '@services/api/notificationService';
import { useUIStore } from '@store/uiStore';

// Mock dependencies
vi.mock('@services/api/notificationService');
vi.mock('@store/uiStore');
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

describe('NotificationPreferencesPage', () => {
  const mockPreferences = {
    id: 'pref-1',
    userId: 'user-1',
    examResultsNotification: true,
    examRemindersNotification: true,
    messageNotifications: true,
    feeNotifications: false,
    attendanceNotifications: true,
    announcementNotifications: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock notificationService
    (notificationService.notificationService.getNotificationPreferences as any).mockResolvedValue(
      mockPreferences
    );
    (
      notificationService.notificationService.updateNotificationPreferences as any
    ).mockResolvedValue(mockPreferences);

    // Mock useUIStore
    (useUIStore as any).mockReturnValue({
      addNotification: vi.fn(),
    });

    // Mock navigator
    Object.defineProperty(global.navigator, 'serviceWorker', {
      value: { ready: Promise.resolve({}) },
      writable: true,
    });
  });

  it('should load and display notification preferences', async () => {
    render(<NotificationPreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Exam Results')).toBeInTheDocument();
      expect(screen.getByText('Exam Reminders')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });
  });

  it('should update exam results notification preference', async () => {
    const addNotification = vi.fn();
    (useUIStore as any).mockReturnValue({
      addNotification,
    });

    render(<NotificationPreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Exam Results')).toBeInTheDocument();
    });

    const examResultsToggle = screen.getAllByRole('switch')[1]; // Skip push notifications toggle
    fireEvent.click(examResultsToggle);

    await waitFor(() => {
      expect(
        notificationService.notificationService.updateNotificationPreferences
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          examResultsNotification: expect.any(Boolean),
        })
      );
    });
  });

  it('should update multiple notification preferences', async () => {
    render(<NotificationPreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Exam Results')).toBeInTheDocument();
    });

    const toggles = screen.getAllByRole('switch');

    // Toggle exam reminders
    fireEvent.click(toggles[2]);

    await waitFor(() => {
      expect(
        notificationService.notificationService.updateNotificationPreferences
      ).toHaveBeenCalled();
    });
  });

  it('should display success notification on preference update', async () => {
    const addNotification = vi.fn();
    (useUIStore as any).mockReturnValue({
      addNotification,
    });

    render(<NotificationPreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Exam Results')).toBeInTheDocument();
    });

    const toggles = screen.getAllByRole('switch');
    fireEvent.click(toggles[1]);

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          message: 'Notification preferences updated',
        })
      );
    });
  });

  it('should handle preference update errors', async () => {
    const addNotification = vi.fn();
    (useUIStore as any).mockReturnValue({
      addNotification,
    });
    (
      notificationService.notificationService.updateNotificationPreferences as any
    ).mockRejectedValueOnce(new Error('Update failed'));

    render(<NotificationPreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Exam Results')).toBeInTheDocument();
    });

    const toggles = screen.getAllByRole('switch');
    fireEvent.click(toggles[1]);

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        })
      );
    });
  });

  it('should display all notification type options', async () => {
    render(<NotificationPreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText('Exam Results')).toBeInTheDocument();
      expect(screen.getByText('Exam Reminders')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Fees')).toBeInTheDocument();
      expect(screen.getByText('Attendance')).toBeInTheDocument();
      expect(screen.getByText('Announcements')).toBeInTheDocument();
    });
  });
});
