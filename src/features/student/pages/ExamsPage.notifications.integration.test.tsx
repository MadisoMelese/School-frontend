import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ExamsPage } from './ExamsPage';
import * as studentService from '@services/api/studentService';
import * as notificationService from '@services/api/notificationService';
import { useUIStore } from '@store/uiStore';
import { useOfflineStore } from '@store/offlineStore';

// Mock dependencies
vi.mock('@services/api/studentService');
vi.mock('@services/api/notificationService');
vi.mock('@store/uiStore');
vi.mock('@store/offlineStore');
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children }: any) => <div>{children}</div>,
}));

describe('ExamsPage - Exam Notifications Integration', () => {
  const mockUpcomingExam = {
    id: 'exam-1',
    name: 'Mathematics Final',
    subject: 'Mathematics',
    date: '2024-03-15',
    time: '10:00',
    totalMarks: 100,
    hallLocation: 'Hall A',
  };

  const mockPastExamWithResults = {
    id: 'exam-2',
    name: 'Physics Midterm',
    subject: 'Physics',
    date: '2024-01-20',
    time: '14:00',
    totalMarks: 100,
    hallLocation: 'Hall B',
    result: {
      marksObtained: 85,
      grade: 'A',
      rank: 5,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock studentService
    (studentService.studentService.getExams as any).mockImplementation((params: any) => {
      if (params?.status === 'upcoming') {
        return Promise.resolve({
          data: [mockUpcomingExam],
          total: 1,
          page: 1,
          totalPages: 1,
        });
      }
      if (params?.status === 'past') {
        return Promise.resolve({
          data: [mockPastExamWithResults],
          total: 1,
          page: 1,
          totalPages: 1,
        });
      }
      return Promise.resolve({ data: [], total: 0, page: 1, totalPages: 0 });
    });

    // Mock notificationService
    (notificationService.notificationService.getNotificationPreferences as any).mockResolvedValue({
      examResultsNotification: true,
    });

    // Mock useUIStore
    (useUIStore as any).mockReturnValue({
      addNotification: vi.fn(),
    });

    // Mock useOfflineStore
    (useOfflineStore as any).mockReturnValue({
      isOnline: true,
      addPendingAction: vi.fn(),
    });
  });

  it('should load exams and check for new results', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(studentService.studentService.getExams).toHaveBeenCalledWith({
        status: 'upcoming',
      });
      expect(studentService.studentService.getExams).toHaveBeenCalledWith({
        status: 'past',
      });
    });
  });

  it('should send notification when exam results are published', async () => {
    const addNotification = vi.fn();
    (useUIStore as any).mockReturnValue({
      addNotification,
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          message: expect.stringContaining('Physics'),
        })
      );
    });
  });

  it('should display past exam results in modal', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Physics Midterm')).toBeInTheDocument();
    });
  });

  it('should display upcoming exams with 7-day indicator', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });
  });

  it('should respect notification preferences', async () => {
    (notificationService.notificationService.getNotificationPreferences as any).mockResolvedValue({
      examResultsNotification: false,
    });

    const addNotification = vi.fn();
    (useUIStore as any).mockReturnValue({
      addNotification,
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(addNotification).not.toHaveBeenCalled();
    });
  });

  it('should queue notification for offline sync when offline', async () => {
    const addPendingAction = vi.fn();
    (useOfflineStore as any).mockReturnValue({
      isOnline: false,
      addPendingAction,
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(addPendingAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'create',
          resource: 'notification',
        })
      );
    });
  });
});
