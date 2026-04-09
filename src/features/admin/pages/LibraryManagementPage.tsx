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
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600 dark:text-neutral-400">Loading books...</p>}
        {error && <p className="text-danger-600 dark:text-danger-200">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Total Books: {books.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Title</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Author</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">ISBN</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Quantity</th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-t border-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:text-white">
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
