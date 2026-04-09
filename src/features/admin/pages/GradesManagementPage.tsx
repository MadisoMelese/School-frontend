import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { apiClient } from '@services/api/client'

interface Grade {
  id: string
  student: string
  exam: string
  marks: number
  grade: string
}

export const GradesManagementPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/grades')
        const data = response.data.data
        setGrades(Array.isArray(data) ? data : data?.grades || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grades')
      } finally {
        setLoading(false)
      }
    }

    loadGrades()
  }, [])

  return (
    <DashboardLayout title="Grades Management" description="Manage all grades">
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600">Loading grades...</p>}
        {error && <p className="text-danger-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600">Total Grades: {grades.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Exam</th>
                    <th className="px-4 py-2 text-left">Marks</th>
                    <th className="px-4 py-2 text-left">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-t">
                      <td className="px-4 py-2">{grade.student}</td>
                      <td className="px-4 py-2">{grade.exam}</td>
                      <td className="px-4 py-2">{grade.marks}</td>
                      <td className="px-4 py-2">{grade.grade}</td>
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

export default GradesManagementPage
