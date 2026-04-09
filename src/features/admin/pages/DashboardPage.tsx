import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Dashboard, Widget } from '@components/organisms/Dashboard'
import { Badge } from '@components/atoms/Badge'
import { useAuth } from '@hooks/useAuth'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { apiClient } from '@services/api/client'

/**
 * Admin Dashboard Page
 * Displays comprehensive admin dashboard with all system resources
 * - HR Summary (Staff management)
 * - Students, Teachers, Parents counts
 * - Classes, Exams, Grades, Fees, Attendance
 * - Announcements, Library, Timetables
 */

interface DashboardState {
  scrollPosition: number
  lastUpdated: number
}

interface ResourceStats {
  students?: number
  teachers?: number
  classes?: number
  exams?: number
  grades?: number
  fees?: number
  attendance?: number
  announcements?: number
  books?: number
  timetables?: number
}

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    `dashboard-${user?.id}`,
    { scrollPosition: 0, lastUpdated: Date.now() }
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [resourceStats, setResourceStats] = useState<ResourceStats>({})

  // Load dashboard data from backend
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch HR summary
        const hrResponse = await apiClient.get('/hr/summary')
        const summary = hrResponse.data.data || hrResponse.data

        // Fetch resource counts
        const stats: ResourceStats = {}
        
        try {
          const studentsRes = await apiClient.get('/students')
          const studentsData = studentsRes.data.data
          stats.students = Array.isArray(studentsData) ? studentsData.length : studentsData?.students?.length || 0
        } catch (e) {
          stats.students = 0
        }

        try {
          const teachersRes = await apiClient.get('/teachers')
          const teachersData = teachersRes.data.data
          stats.teachers = Array.isArray(teachersData) ? teachersData.length : teachersData?.teachers?.length || 0
        } catch (e) {
          stats.teachers = 0
        }

        try {
          const classesRes = await apiClient.get('/classes')
          const classesData = classesRes.data.data
          stats.classes = Array.isArray(classesData) ? classesData.length : classesData?.classes?.length || 0
        } catch (e) {
          stats.classes = 0
        }

        try {
          const examsRes = await apiClient.get('/exams')
          const examsData = examsRes.data.data
          stats.exams = Array.isArray(examsData) ? examsData.length : examsData?.exams?.length || 0
        } catch (e) {
          stats.exams = 0
        }

        try {
          const gradesRes = await apiClient.get('/grades')
          const gradesData = gradesRes.data.data
          stats.grades = Array.isArray(gradesData) ? gradesData.length : gradesData?.grades?.length || 0
        } catch (e) {
          stats.grades = 0
        }

        try {
          const feesRes = await apiClient.get('/fees')
          const feesData = feesRes.data.data
          stats.fees = Array.isArray(feesData) ? feesData.length : feesData?.fees?.length || 0
        } catch (e) {
          stats.fees = 0
        }

        try {
          const attendanceRes = await apiClient.get('/attendance')
          const attendanceData = attendanceRes.data.data
          stats.attendance = Array.isArray(attendanceData) ? attendanceData.length : attendanceData?.attendance?.length || 0
        } catch (e) {
          stats.attendance = 0
        }

        try {
          const announcementsRes = await apiClient.get('/announcements')
          const announcementsData = announcementsRes.data.data
          stats.announcements = Array.isArray(announcementsData) ? announcementsData.length : announcementsData?.announcements?.length || 0
        } catch (e) {
          stats.announcements = 0
        }

        try {
          const booksRes = await apiClient.get('/library/books')
          const booksData = booksRes.data.data
          stats.books = Array.isArray(booksData) ? booksData.length : booksData?.books?.length || 0
        } catch (e) {
          stats.books = 0
        }

        try {
          const timetablesRes = await apiClient.get('/timetables')
          const timetablesData = timetablesRes.data.data
          stats.timetables = Array.isArray(timetablesData) ? timetablesData.length : timetablesData?.timetables?.length || 0
        } catch (e) {
          stats.timetables = 0
        }

        setResourceStats(stats)

        // Create widgets with real data
        const dashboardWidgets: Widget[] = [
          {
            id: 'hr-summary',
            title: 'HR Summary',
            type: 'stats',
            size: 'large',
            content: (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-xs text-primary-600 font-medium mb-1">Total Staff</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {summary?.totalStaff || 0}
                  </p>
                </div>
                <div className="bg-success-50 rounded-lg p-4">
                  <p className="text-xs text-success-600 font-medium mb-1">Active</p>
                  <p className="text-2xl font-bold text-success-900">
                    {summary?.activeStaff || 0}
                  </p>
                </div>
                <div className="bg-warning-50 rounded-lg p-4">
                  <p className="text-xs text-warning-600 font-medium mb-1">On Leave</p>
                  <p className="text-2xl font-bold text-warning-900">
                    {summary?.staffOnLeave || 0}
                  </p>
                </div>
                <div className="bg-info-50 rounded-lg p-4">
                  <p className="text-xs text-info-600 font-medium mb-1">Permanent</p>
                  <p className="text-2xl font-bold text-info-900">
                    {summary?.permanentStaff || 0}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-xs text-neutral-600 font-medium mb-1">Contract</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {summary?.contractStaff || 0}
                  </p>
                </div>
                <div className="bg-danger-50 rounded-lg p-4">
                  <p className="text-xs text-danger-600 font-medium mb-1">Inactive</p>
                  <p className="text-2xl font-bold text-danger-900">
                    {summary?.inactiveStaff || 0}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: 'academic-resources',
            title: 'Academic Resources',
            type: 'stats',
            size: 'large',
            content: (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Students</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.students || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-600 font-medium mb-1">Teachers</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.teachers || 0}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-xs text-indigo-600 font-medium mb-1">Classes</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {stats.classes || 0}
                  </p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4">
                  <p className="text-xs text-cyan-600 font-medium mb-1">Exams</p>
                  <p className="text-2xl font-bold text-cyan-900">
                    {stats.exams || 0}
                  </p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-xs text-teal-600 font-medium mb-1">Grades</p>
                  <p className="text-2xl font-bold text-teal-900">
                    {stats.grades || 0}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Timetables</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {stats.timetables || 0}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: 'operational-data',
            title: 'Operational Data',
            type: 'stats',
            size: 'large',
            content: (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-rose-50 rounded-lg p-4">
                  <p className="text-xs text-rose-600 font-medium mb-1">Attendance Records</p>
                  <p className="text-2xl font-bold text-rose-900">
                    {stats.attendance || 0}
                  </p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-xs text-pink-600 font-medium mb-1">Fees</p>
                  <p className="text-2xl font-bold text-pink-900">
                    {stats.fees || 0}
                  </p>
                </div>
                <div className="bg-fuchsia-50 rounded-lg p-4">
                  <p className="text-xs text-fuchsia-600 font-medium mb-1">Announcements</p>
                  <p className="text-2xl font-bold text-fuchsia-900">
                    {stats.announcements || 0}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-xs text-amber-600 font-medium mb-1">Library Books</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {stats.books || 0}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: 'departments',
            title: 'Staff by Department',
            type: 'list',
            size: 'medium',
            content: (
              <div className="space-y-3">
                {summary?.departmentBreakdown && Object.entries(summary.departmentBreakdown).length > 0 ? (
                  Object.entries(summary.departmentBreakdown).map(([dept, count]: [string, any]) => (
                    <div
                      key={dept}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 capitalize">{dept}</p>
                      </div>
                      <Badge variant="info">{count}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-neutral-600">No department data available</p>
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'contract-types',
            title: 'Contract Types',
            type: 'stats',
            size: 'medium',
            content: (
              <div className="space-y-4">
                {summary?.contractTypeBreakdown ? (
                  Object.entries(summary.contractTypeBreakdown).map(([type, count]: [string, any]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600 capitalize">{type}</span>
                        <Badge variant="success">{count}</Badge>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${((count as number) / (summary?.totalStaff || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-neutral-600">No contract data available</p>
                  </div>
                )}
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
      title="Admin Dashboard"
      description="Complete system overview with HR, academic, and operational data."
    >
      <Dashboard widgets={widgets} loading={loading} error={error || undefined} />
    </DashboardLayout>
  )
}

export default AdminDashboardPage
