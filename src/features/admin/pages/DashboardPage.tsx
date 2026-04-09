import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Dashboard, Widget } from '@components/organisms/Dashboard'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import { useAuth } from '@hooks/useAuth'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { adminService } from '@services/api/adminService'

/**
 * Admin Dashboard Page
 * Displays role-specific widgets for admins:
 * - System statistics
 * - Recent user activity
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
  const [statistics, setStatistics] = useState<any>(null)
  const [healthMetrics, setHealthMetrics] = useState<any>(null)

  // Load dashboard data from backend
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard statistics
        const stats = await adminService.getDashboardStats()
        setStatistics(stats)

        // Fetch system health metrics
        const health = await adminService.getSystemHealth()
        setHealthMetrics(health)

        // Create widgets with real data
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
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-primary-600 mt-2">
                    {stats.activeUsers} active
                  </p>
                </div>
                <div className="bg-success-50 rounded-lg p-4">
                  <p className="text-xs text-success-600 font-medium mb-1">Students</p>
                  <p className="text-2xl font-bold text-success-900">
                    {stats.totalStudents}
                  </p>
                </div>
                <div className="bg-info-50 rounded-lg p-4">
                  <p className="text-xs text-info-600 font-medium mb-1">Teachers</p>
                  <p className="text-2xl font-bold text-info-900">
                    {stats.totalTeachers}
                  </p>
                </div>
                <div className="bg-warning-50 rounded-lg p-4">
                  <p className="text-xs text-warning-600 font-medium mb-1">Parents</p>
                  <p className="text-2xl font-bold text-warning-900">
                    {stats.totalParents}
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
                        height: `${(stats.totalStudents / stats.totalUsers) * 100}%`,
                      }}
                      title="Students"
                    />
                    <div
                      className="flex-1 bg-info-500 rounded-t"
                      style={{
                        height: `${(stats.totalTeachers / stats.totalUsers) * 100}%`,
                      }}
                      title="Teachers"
                    />
                    <div
                      className="flex-1 bg-warning-500 rounded-t"
                      style={{
                        height: `${(stats.totalParents / stats.totalUsers) * 100}%`,
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
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity: any, index: number) => (
                    <div
                      key={activity.userId + index}
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
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-neutral-600">No recent activity</p>
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
                    <span className="text-sm text-neutral-600">System Status</span>
                    <Badge
                      variant={
                        health.status === 'healthy'
                          ? 'success'
                          : health.status === 'degraded'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {health.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Uptime</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {(health.uptime * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">API Response</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {health.responseTime}ms
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Error Rate</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {(health.errorRate * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Last Checked</p>
                    <p className="text-xs font-bold text-neutral-900">
                      {new Date(health.lastChecked).toLocaleTimeString()}
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
