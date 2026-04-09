import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { apiClient } from '@services/api/client'

interface Fee {
  id: string
  student: string
  amount: number
  dueDate: string
  status: string
}

export const FeesManagementPage: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFees = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/fees')
        const data = response.data.data
        setFees(Array.isArray(data) ? data : data?.fees || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fees')
      } finally {
        setLoading(false)
      }
    }

    loadFees()
  }, [])

  return (
    <DashboardLayout title="Fees Management" description="Manage all fees">
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600">Loading fees...</p>}
        {error && <p className="text-danger-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600">Total Fees: {fees.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Due Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.id} className="border-t">
                      <td className="px-4 py-2">{fee.student}</td>
                      <td className="px-4 py-2">{fee.amount}</td>
                      <td className="px-4 py-2">{fee.dueDate}</td>
                      <td className="px-4 py-2">{fee.status}</td>
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

export default FeesManagementPage
