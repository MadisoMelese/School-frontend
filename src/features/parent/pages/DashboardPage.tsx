import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Dashboard, Widget } from '@components/organisms/Dashboard'
import { GradeCard } from '@components/organisms/GradeCard'
import { Card } from '@components/molecules/Card'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import { useAuth } from '@hooks/useAuth'
import { useLocalStorage } from '@hooks/useLocalStorage'

/**
 * Parent Dashboard Page
 * Displays role-specific widgets for parents:
 * - Child's recent grades
 * - Child's attendance
 * - Upcoming exams
 * - Fee status
 */

interface DashboardState {
  scrollPosition: number
  lastUpdated: number
}

export const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    `dashboard-${user?.id}`,
    { scrollPosition: 0, lastUpdated: Date.now() }
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [widgets, setWidgets] = useState<Widget[]>([])

  // Mock data - replace with actual API calls
  const mockChildData = {
    name: 'John Doe',
    enrollmentNumber: 'STU-2024-001',
    class: '10-A',
    currentGPA: 3.8,
    attendancePercentage: 92,
  }

  const mockGrades = [
    {
      subject: 'Mathematics',
      marksObtained: 88,
      totalMarks: 100,
      grade: 'A',
      remarks: 'Excellent performance',
      examDate: new Date('2024-01-15'),
    },
    {
      subject: 'English',
      marksObtained: 82,
      totalMarks: 100,
      grade: 'A-',
      remarks: 'Good work',
      examDate: new Date('2024-01-16'),
    },
    {
      subject: 'Science',
      marksObtained: 95,
      totalMarks: 100,
      grade: 'A+',
      remarks: 'Outstanding',
      examDate: new Date('2024-01-17'),
    },
  ]

  const mockAttendance = [
    { date: '2024-01-15', status: 'present' as const },
    { date: '2024-01-16', status: 'present' as const },
    { date: '2024-01-17', status: 'present' as const },
    { date: '2024-01-18', status: 'present' as const },
    { date: '2024-01-19', status: 'absent' as const },
  ]

  const mockExams = [
    {
      id: '1',
      name: 'Final Exam',
      subject: 'Mathematics',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      time: '09:00 AM',
      totalMarks: 100,
      hallLocation: 'Hall A',
    },
    {
      id: '2',
      name: 'Final Exam',
      subject: 'English',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      time: '02:00 PM',
      totalMarks: 100,
      hallLocation: 'Hall B',
    },
  ]

  const mockFees = [
    {
      id: '1',
      title: 'Tuition Fee',
      amount: 5000,
      paidAmount: 5000,
      dueDate: '2024-01-31',
      status: 'paid' as const,
      academicYear: '2023-2024',
    },
    {
      id: '2',
      title: 'Activity Fee',
      amount: 500,
      paidAmount: 250,
      dueDate: '2024-02-15',
      status: 'partial' as const,
      academicYear: '2023-2024',
    },
    {
      id: '3',
      title: 'Transport Fee',
      amount: 1000,
      paidAmount: 0,
      dueDate: '2024-02-28',
      status: 'pending' as const,
      academicYear: '2023-2024',
    },
  ]

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Create widgets
        const dashboardWidgets: Widget[] = [
          {
            id: 'child-overview',
            title: 'Child Overview',
            type: 'stats',
            size: 'large',
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">Name</p>
                    <p className="text-lg font-bold text-primary-900">{mockChildData.name}</p>
                  </div>
                  <div className="bg-success-50 rounded-lg p-4">
                    <p className="text-xs text-success-600 font-medium mb-1">Class</p>
                    <p className="text-lg font-bold text-success-900">{mockChildData.class}</p>
                  </div>
                  <div className="bg-info-50 rounded-lg p-4">
                    <p className="text-xs text-info-600 font-medium mb-1">GPA</p>
                    <p className="text-lg font-bold text-info-900">
                      {mockChildData.currentGPA.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-warning-50 rounded-lg p-4">
                    <p className="text-xs text-warning-600 font-medium mb-1">Attendance</p>
                    <p className="text-lg font-bold text-warning-900">
                      {mockChildData.attendancePercentage}%
                    </p>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'recent-grades',
            title: 'Recent Grades',
            type: 'card',
            size: 'large',
            content: (
              <div className="space-y-3">
                {mockGrades.slice(0, 2).map((grade) => (
                  <GradeCard key={grade.subject} {...grade} />
                ))}
              </div>
            ),
          },
          {
            id: 'attendance-status',
            title: 'Attendance Status',
            type: 'stats',
            size: 'medium',
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Current Rate</span>
                  <Badge variant="success" className="text-lg">
                    {mockChildData.attendancePercentage}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-600">
                    <span>Present Days</span>
                    <span>4 / 5</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-success-500"
                      style={{ width: '80%' }}
                    />
                  </div>
                </div>
                {mockChildData.attendancePercentage < 75 && (
                  <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-xs text-danger-700">
                      ⚠️ Attendance below 75%. Please ensure regular attendance.
                    </p>
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'upcoming-exams',
            title: 'Upcoming Exams',
            type: 'list',
            size: 'medium',
            content: (
              <div className="space-y-3">
                {mockExams.map((exam) => (
                  <div key={exam.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <Icon name="Calendar" size={20} className="text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900">{exam.subject}</p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {new Date(exam.date).toLocaleDateString()} at {exam.time}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{exam.hallLocation}</p>
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'fee-status',
            title: 'Fee Status',
            type: 'stats',
            size: 'medium',
            content: (
              <div className="space-y-3">
                {mockFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">{fee.title}</p>
                      <p className="text-xs text-neutral-600">
                        ₹{fee.paidAmount} / ₹{fee.amount}
                      </p>
                    </div>
                    <Badge
                      variant={
                        fee.status === 'paid'
                          ? 'success'
                          : fee.status === 'partial'
                            ? 'info'
                            : 'warning'
                      }
                    >
                      {fee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ),
          },
        ]

        setWidgets(dashboardWidgets)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Restore scroll position
  useEffect(() => {
    if (dashboardState?.scrollPosition) {
      window.scrollTo(0, dashboardState.scrollPosition)
    }
  }, [dashboardState])

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      setDashboardState({
        ...dashboardState,
        scrollPosition: window.scrollY,
        lastUpdated: Date.now(),
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [dashboardState, setDashboardState])

  return (
    <DashboardLayout
      title="Dashboard"
      description="Monitor your child's academic progress."
    >
      <Dashboard widgets={widgets} loading={loading} error={error || undefined} />
    </DashboardLayout>
  )
}

export default ParentDashboardPage
