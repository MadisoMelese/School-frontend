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
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600 dark:text-neutral-400">Loading grades...</p>}
        {error && <p className="text-danger-600 dark:text-danger-200">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Total Grades: {grades.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Student</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Exam</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Marks</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-t border-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:text-white">
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
