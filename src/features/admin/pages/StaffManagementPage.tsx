import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { apiClient } from '@services/api/client'

interface Staff {
  id: string
  name: string
  email: string
  department: string
  position: string
  status: string
  contractType: string
}

export const StaffManagementPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStaff = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/hr')
        const data = response.data.data
        setStaff(Array.isArray(data) ? data : data?.staff || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load staff')
      } finally {
        setLoading(false)
      }
    }

    loadStaff()
  }, [])

  return (
    <DashboardLayout title="Staff Management" description="Manage all staff members">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600 dark:text-neutral-400">Loading staff...</p>}
        {error && <p className="text-danger-600 dark:text-danger-200">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Total Staff: {staff.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Name</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Email</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Department</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Position</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Contract</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-t border-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:text-white">
                      <td className="px-4 py-2">{member.name}</td>
                      <td className="px-4 py-2">{member.email}</td>
                      <td className="px-4 py-2">{member.department}</td>
                      <td className="px-4 py-2">{member.position}</td>
                      <td className="px-4 py-2">{member.contractType}</td>
                      <td className="px-4 py-2">{member.status}</td>
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

export default StaffManagementPage
