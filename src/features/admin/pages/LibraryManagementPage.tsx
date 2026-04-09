import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { apiClient } from '@services/api/client'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  quantity: number
  available: number
}

export const LibraryManagementPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/library/books')
        const data = response.data.data
        setBooks(Array.isArray(data) ? data : data?.books || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load books')
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

  return (
    <DashboardLayout title="Library Management" description="Manage library books">
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600">Loading books...</p>}
        {error && <p className="text-danger-600">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600">Total Books: {books.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Author</th>
                    <th className="px-4 py-2 text-left">ISBN</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-t">
                      <td className="px-4 py-2">{book.title}</td>
                      <td className="px-4 py-2">{book.author}</td>
                      <td className="px-4 py-2">{book.isbn}</td>
                      <td className="px-4 py-2">{book.quantity}</td>
                      <td className="px-4 py-2">{book.available}</td>
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

export default LibraryManagementPage
