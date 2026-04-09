import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { apiClient } from '@services/api/client'

interface Attendance {
  id: string
  student: string
  date: string
  status: string
  class: string
}

export const AttendanceManagementPage: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/attendance')
        const data = response.data.data
        setAttendance(Array.isArray(data) ? data : data?.attendance || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendance')
      } finally {
        setLoading(false)
      }
    }

    loadAttendance()
  }, [])

  return (
    <DashboardLayout title="Attendance Management" description="Manage all attendance records">
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600">Loading attendance...</p>}
        {error && <p className="text-danger-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600">Total Records: {attendance.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Class</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-t">
                      <td className="px-4 py-2">{record.student}</td>
                      <td className="px-4 py-2">{record.class}</td>
                      <td className="px-4 py-2">{record.date}</td>
                      <td className="px-4 py-2">{record.status}</td>
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

export default AttendanceManagementPage
