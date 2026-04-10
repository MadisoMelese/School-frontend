import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationCenterPage } from './NotificationCenterPage'
import * as notificationService from '@services/api/notificationService'

// Mock dependencies
vi.mock('@services/api/notificationService')
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

describe('NotificationCenterPage', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      type: 'exam_result' as const,
      title: 'Mathematics Results',
      message: 'Your Mathematics exam results are now available',
      isRead: false,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'notif-2',
      type: 'exam_reminder' as const,
      title: 'Physics Exam Tomorrow',
      message: 'Your Physics exam is scheduled for tomorrow at 2:00 PM',
      isRead: true,
      createdAt: '2024-01-14T15:00:00Z',
    },
    {
      id: 'notif-3',
      type: 'message' as const,
      title: 'New Message from Teacher',
      message: 'You have a new message from your teacher',
      isRead: false,
      createdAt: '2024-01-13T09:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock notificationService
    ;(notificationService.notificationService.getNotifications as any).mockResolvedValue({
      notifications: mockNotifications,
      total: mockNotifications.length,
    })
    ;(notificationService.notificationService.markNotificationAsRead as any).mockResolvedValue({
      message: 'Marked as read',
    })
  })

  it('should load and display all notifications', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics Results')).toBeInTheDocument()
      expect(screen.getByText('Physics Exam Tomorrow')).toBeInTheDocument()
      expect(screen.getByText('New Message from Teacher')).toBeInTheDocument()
    })
  })

  it('should display unread count', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText(/You have 2 unread notifications/)).toBeInTheDocument()
    })
  })

  it('should filter notifications by type', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics Results')).toBeInTheDocument()
    })

    const examResultFilter = screen.getByText('Exam Result')
    fireEvent.click(examResultFilter)

    await waitFor(() => {
      expect(screen.getByText('Mathematics Results')).toBeInTheDocument()
      expect(screen.queryByText('Physics Exam Tomorrow')).not.toBeInTheDocument()
    })
  })

  it('should mark notification as read when clicked', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics Results')).toBeInTheDocument()
    })

    const notification = screen.getByText('Mathematics Results').closest('div')
    fireEvent.click(notification!)

    await waitFor(() => {
      expect(notificationService.notificationService.markNotificationAsRead).toHaveBeenCalledWith(
        'notif-1'
      )
    })
  })

  it('should display notification badges for unread items', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      const newBadges = screen.getAllByText('New')
      expect(newBadges.length).toBe(2) // Two unread notifications
    })
  })

  it('should display empty state when no notifications', async () => {
    (notificationService.notificationService.getNotifications as any).mockResolvedValueOnce({
      notifications: [],
      total: 0,
    })

    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument()
    })
  })

  it('should display empty state for filtered results', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics Results')).toBeInTheDocument()
    })

    const feeFilter = screen.getByText('Fee')
    fireEvent.click(feeFilter)

    await waitFor(() => {
      expect(screen.getByText('No notifications of this type')).toBeInTheDocument()
    })
  })

  it('should display notification timestamps', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('Mathematics Results')).toBeInTheDocument()
      // Check that dates are displayed (exact format depends on locale)
      const dateElements = screen.getAllByText(/Jan/)
      expect(dateElements.length).toBeGreaterThan(0)
    })
  })

  it('should handle notification loading errors', async () => {
    (notificationService.notificationService.getNotifications as any).mockRejectedValueOnce(
      new Error('Failed to load notifications')
    )

    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument()
    })
  })

  it('should display all notification type filters', async () => {
    render(<NotificationCenterPage />)

    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Exam Result')).toBeInTheDocument()
      expect(screen.getByText('Exam Reminder')).toBeInTheDocument()
      expect(screen.getByText('Message')).toBeInTheDocument()
      expect(screen.getByText('Fee')).toBeInTheDocument()
      expect(screen.getByText('Attendance')).toBeInTheDocument()
      expect(screen.getByText('Announcement')).toBeInTheDocument()
    })
  })
})
