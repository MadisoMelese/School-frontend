import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Dashboard, Widget } from '@components/organisms/Dashboard'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import { useAuth } from '@hooks/useAuth'
import { useLocalStorage } from '@hooks/useLocalStorage'
import { apiClient } from '@services/api/client'

/**
 * Admin Dashboard Page
 * Displays admin dashboard with HR summary and system info
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
  const [hrSummary, setHrSummary] = useState<any>(null)
  const [dashboardInfo, setDashboardInfo] = useState<any>(null)

  // Load dashboard data from backend
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch admin dashboard info
        const dashboardResponse = await apiClient.get('/admin/dashboard')
        setDashboardInfo(dashboardResponse.data.data || dashboardResponse.data)

        // Fetch HR summary
        const hrResponse = await apiClient.get('/hr/summary')
        const summary = hrResponse.data.data || hrResponse.data
        setHrSummary(summary)

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
      description="System overview and HR management."
    >
      <Dashboard widgets={widgets} loading={loading} error={error || undefined} />
    </DashboardLayout>
  )
}

export default AdminDashboardPage
