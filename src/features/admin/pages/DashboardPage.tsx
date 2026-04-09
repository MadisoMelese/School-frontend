import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Dashboard, Widget } from '@components/organisms/Dashboard'
import { Card } from '@components/molecules/Card'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import { useAuth } from '@hooks/useAuth'
import { useLocalStorage } from '@hooks/useLocalStorage'

/**
 * Admin Dashboard Page
 * Displays role-specific widgets for admins:
 * - System statistics
 * - Recent user activity
 * - Pending approvals
 * - System health metrics
 */

interface DashboardState {
  scrollPosition: number
  lastUpdated: number
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

  // Mock data - replace with actual API calls
  const mockStatistics = {
    totalUsers: 1250,
    activeUsers: 1180,
    totalStudents: 850,
    totalTeachers: 120,
    totalParents: 280,
  }

  const mockUserActivity = [
    {
      id: '1',
      userName: 'John Doe',
      action: 'Logged in',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      userName: 'Jane Smith',
      action: 'Submitted grades',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userName: 'Admin User',
      action: 'Created new user',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      userName: 'Teacher Account',
      action: 'Marked attendance',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const mockPendingApprovals = [
    {
      id: '1',
      type: 'User Registration',
      description: 'New teacher account pending approval',
      submittedBy: 'Principal',
      submittedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
    },
    {
      id: '2',
      type: 'Fee Waiver',
      description: 'Student fee waiver request',
      submittedBy: 'Parent',
      submittedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
    },
  ]

  const mockHealthMetrics = {
    systemUptime: 99.8,
    databaseStatus: 'healthy',
    apiResponseTime: 145,
    errorRate: 0.02,
    activeConnections: 342,
  }

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
            id: 'statistics',
            title: 'System Statistics',
            type: 'stats',
            size: 'large',
            content: (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-xs text-primary-600 font-medium mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {mockStatistics.totalUsers}
                  </p>
                  <p className="text-xs text-primary-600 mt-2">
                    {mockStatistics.activeUsers} active
                  </p>
                </div>
                <div className="bg-success-50 rounded-lg p-4">
                  <p className="text-xs text-success-600 font-medium mb-1">Students</p>
                  <p className="text-2xl font-bold text-success-900">
                    {mockStatistics.totalStudents}
                  </p>
                </div>
                <div className="bg-info-50 rounded-lg p-4">
                  <p className="text-xs text-info-600 font-medium mb-1">Teachers</p>
                  <p className="text-2xl font-bold text-info-900">
                    {mockStatistics.totalTeachers}
                  </p>
                </div>
                <div className="bg-warning-50 rounded-lg p-4">
                  <p className="text-xs text-warning-600 font-medium mb-1">Parents</p>
                  <p className="text-2xl font-bold text-warning-900">
                    {mockStatistics.totalParents}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 md:col-span-2">
                  <p className="text-xs text-neutral-600 font-medium mb-1">
                    User Distribution
                  </p>
                  <div className="flex items-end gap-2 h-12 mt-2">
                    <div
                      className="flex-1 bg-success-500 rounded-t"
                      style={{
                        height: `${(mockStatistics.totalStudents / mockStatistics.totalUsers) * 100}%`,
                      }}
                      title="Students"
                    />
                    <div
                      className="flex-1 bg-info-500 rounded-t"
                      style={{
                        height: `${(mockStatistics.totalTeachers / mockStatistics.totalUsers) * 100}%`,
                      }}
                      title="Teachers"
                    />
                    <div
                      className="flex-1 bg-warning-500 rounded-t"
                      style={{
                        height: `${(mockStatistics.totalParents / mockStatistics.totalUsers) * 100}%`,
                      }}
                      title="Parents"
                    />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'user-activity',
            title: 'Recent User Activity',
            type: 'list',
            size: 'medium',
            content: (
              <div className="space-y-3">
                {mockUserActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900">{activity.userName}</p>
                      <p className="text-sm text-neutral-600 mt-1">{activity.action}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Icon name="Activity" size={20} className="text-neutral-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'pending-approvals',
            title: 'Pending Approvals',
            type: 'list',
            size: 'medium',
            content: (
              <div className="space-y-3">
                {mockPendingApprovals.length > 0 ? (
                  mockPendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="p-3 bg-neutral-50 rounded-lg border-l-4 border-warning-500"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-neutral-900">{approval.type}</p>
                          <p className="text-xs text-neutral-600 mt-1">
                            {approval.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            approval.priority === 'high'
                              ? 'danger'
                              : approval.priority === 'medium'
                                ? 'warning'
                                : 'info'
                          }
                        >
                          {approval.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500">
                        By {approval.submittedBy} •{' '}
                        {new Date(approval.submittedDate).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-neutral-600">No pending approvals</p>
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'health-metrics',
            title: 'System Health',
            type: 'stats',
            size: 'medium',
            content: (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600">System Uptime</span>
                    <Badge variant="success">{mockHealthMetrics.systemUptime}%</Badge>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-success-500"
                      style={{ width: `${mockHealthMetrics.systemUptime}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Database</p>
                    <Badge variant="success">{mockHealthMetrics.databaseStatus}</Badge>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">API Response</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {mockHealthMetrics.apiResponseTime}ms
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Error Rate</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {mockHealthMetrics.errorRate}%
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Connections</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {mockHealthMetrics.activeConnections}
                    </p>
                  </div>
                </div>
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
      description="System overview and administration controls."
    >
      <Dashboard widgets={widgets} loading={loading} error={error || undefined} />
    </DashboardLayout>
  )
}

export default AdminDashboardPage
