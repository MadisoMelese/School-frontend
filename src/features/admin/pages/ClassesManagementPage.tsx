import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { apiClient } from '@services/api/client'

/**
 * Classes Management Page
 */

interface Class {
  id: string
  name: string
  section: string
  teacher: string
  studentCount: number
}

export const ClassesManagementPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/classes')
        const data = response.data.data
        setClasses(Array.isArray(data) ? data : data?.classes || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes')
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  return (
    <DashboardLayout title="Classes Management" description="Manage all classes">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600 dark:text-neutral-400">Loading classes...</p>}
        {error && <p className="text-danger-600 dark:text-danger-200">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Total Classes: {classes.length}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 dark:bg-neutral-700">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{cls.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Section: {cls.section}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Teacher: {cls.teacher}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Students: {cls.studentCount}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ClassesManagementPage
