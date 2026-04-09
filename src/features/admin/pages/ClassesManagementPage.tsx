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
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600">Loading classes...</p>}
        {error && <p className="text-danger-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600">Total Classes: {classes.length}</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900">{cls.name}</h3>
                  <p className="text-sm text-neutral-600">Section: {cls.section}</p>
                  <p className="text-sm text-neutral-600">Teacher: {cls.teacher}</p>
                  <p className="text-sm text-neutral-600">Students: {cls.studentCount}</p>
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
