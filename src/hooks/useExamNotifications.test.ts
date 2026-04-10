import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExamNotifications } from './useExamNotifications'
import { useUIStore } from '@store/uiStore'
import { useOfflineStore } from '@store/offlineStore'
import * as notificationService from '@services/api/notificationService'
import type { Exam } from '@types'

// Mock the services
vi.mock('@store/uiStore')
vi.mock('@store/offlineStore')
vi.mock('@services/api/notificationService')

describe('useExamNotifications', () => {
  const mockExam: Exam = {
    id: 'exam-1',
    name: 'Mathematics Final',
    subject: 'Mathematics',
    date: '2024-01-15',
    time: '10:00',
    totalMarks: 100,
    hallLocation: 'Hall A',
    result: {
      marksObtained: 85,
      grade: 'A',
      rank: 5,
    },
  }

  const mockExamWithoutResults: Exam = {
    id: 'exam-2',
    name: 'Physics Midterm',
    subject: 'Physics',
    date: '2024-02-20',
    time: '14:00',
    totalMarks: 100,
    hallLocation: 'Hall B',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useUIStore
    ;(useUIStore as any).mockReturnValue({
      addNotification: vi.fn(),
    })

    // Mock useOfflineStore
    ;(useOfflineStore as any).mockReturnValue({
      isOnline: true,
      addPendingAction: vi.fn(),
    })

    // Mock notificationService
    ;(notificationService.notificationService.getNotificationPreferences as any).mockResolvedValue({
      examResultsNotification: true,
    })
  })

  it('should load notification preferences on mount', async () => {
    const { result } = renderHook(() => useExamNotifications())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(notificationService.notificationService.getNotificationPreferences).toHaveBeenCalled()
  })

  it('should detect exam with published results', () => {
    const { result } = renderHook(() => useExamNotifications())

    const hasResults = result.current.sendExamResultNotification

    expect(mockExam.result).toBeDefined()
    expect(mockExam.result?.marksObtained).toBe(85)
  })

  it('should not send notification for exam without results', async () => {
    const { result } = renderHook(() => useExamNotifications())
    const addNotification = vi.fn()

    ;(useUIStore as any).mockReturnValue({
      addNotification,
    })

    await act(async () => {
      result.current.checkExamsForNewResults([mockExamWithoutResults])
    })

    expect(addNotification).not.toHaveBeenCalled()
  })

  it('should send notification when exam results are published', async () => {
    const addNotification = vi.fn()
    ;(useUIStore as any).mockReturnValue({
      addNotification,
    })

    const { result } = renderHook(() => useExamNotifications())

    await act(async () => {
      result.current.checkExamsForNewResults([mockExam])
    })

    expect(addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        message: expect.stringContaining('Mathematics'),
      })
    )
  })

  it('should respect notification preferences', async () => {
    (notificationService.notificationService.getNotificationPreferences as any).mockResolvedValue({
      examResultsNotification: false,
    })

    const addNotification = vi.fn()
    ;(useUIStore as any).mockReturnValue({
      addNotification,
    })

    const { result } = renderHook(() => useExamNotifications())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
      result.current.checkExamsForNewResults([mockExam])
    })

    expect(addNotification).not.toHaveBeenCalled()
  })

  it('should not send duplicate notifications for same exam', async () => {
    const addNotification = vi.fn()
    ;(useUIStore as any).mockReturnValue({
      addNotification,
    })

    const { result } = renderHook(() => useExamNotifications())

    await act(async () => {
      result.current.checkExamsForNewResults([mockExam])
      result.current.checkExamsForNewResults([mockExam])
    })

    expect(addNotification).toHaveBeenCalledTimes(1)
  })

  it('should queue notification for offline sync when offline', async () => {
    const addPendingAction = vi.fn()
    ;(useOfflineStore as any).mockReturnValue({
      isOnline: false,
      addPendingAction,
    })

    const addNotification = vi.fn()
    ;(useUIStore as any).mockReturnValue({
      addNotification,
    })

    const { result } = renderHook(() => useExamNotifications())

    await act(async () => {
      result.current.checkExamsForNewResults([mockExam])
    })

    expect(addPendingAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'create',
        resource: 'notification',
      })
    )
  })
})
