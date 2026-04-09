import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { apiClient } from '@services/api/client'

interface Exam {
  id: string
  name: string
  class: string
  date: string
  totalMarks: number
}

export const ExamsManagementPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/exams')
        const data = response.data.data
        setExams(Array.isArray(data) ? data : data?.exams || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exams')
      } finally {
        setLoading(false)
      }
    }

    loadExams()
  }, [])

  return (
    <DashboardLayout title="Exams Management" description="Manage all exams">
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600">Loading exams...</p>}
        {error && <p className="text-danger-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600">Total Exams: {exams.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Class</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id} className="border-t">
                      <td className="px-4 py-2">{exam.name}</td>
                      <td className="px-4 py-2">{exam.class}</td>
                      <td className="px-4 py-2">{exam.date}</td>
                      <td className="px-4 py-2">{exam.totalMarks}</td>
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

export default ExamsManagementPage
