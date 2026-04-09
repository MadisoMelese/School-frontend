import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { useAuth } from '@hooks/useAuth'
import { apiClient } from '@services/api/client'

/**
 * Teachers Management Page
 * Allows admins to view, create, update, and delete teachers
 */

interface Teacher {
  id: string
  name: string
  email: string
  department: string
  qualification: string
  status: string
}

export const TeachersManagementPage: React.FC = () => {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/teachers')
        const data = response.data.data
        setTeachers(Array.isArray(data) ? data : data?.teachers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teachers')
      } finally {
        setLoading(false)
      }
    }

    loadTeachers()
  }, [])

  return (
    <DashboardLayout
      title="Teachers Management"
      description="Manage all teachers in the system"
    >
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600">Loading teachers...</p>}
        {error && <p className="text-danger-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600">Total Teachers: {teachers.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Qualification</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-t">
                      <td className="px-4 py-2">{teacher.name}</td>
                      <td className="px-4 py-2">{teacher.email}</td>
                      <td className="px-4 py-2">{teacher.department}</td>
                      <td className="px-4 py-2">{teacher.qualification}</td>
                      <td className="px-4 py-2">{teacher.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TeachersManagementPage
