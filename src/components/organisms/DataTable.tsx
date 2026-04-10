import React, { useState, useMemo } from 'react'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { Spinner } from '../atoms/Spinner'
import { Pagination } from '../molecules/Pagination'
import { Icon } from '../atoms/Icon'

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  onFilter?: (query: string) => void
  onPageChange?: (page: number) => void
  loading?: boolean
  error?: string
  pageSize?: number
  totalItems?: number
  keyExtractor?: (row: T, index: number) => string
}

type SortDirection = 'asc' | 'desc' | null

export const DataTable: React.FC<DataTableProps<any>> = ({
  columns,
  data,
  onSort,
  onFilter,
  onPageChange,
  loading = false,
  error,
  pageSize = 10,
  totalItems = data?.length,
  keyExtractor = (_, index) => index.toString(),
}) => {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [filterQuery, setFilterQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (key: string) => {
    let newDirection: SortDirection = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      newDirection = 'desc'
    } else if (sortKey === key && sortDirection === 'desc') {
      newDirection = null
    }

    setSortKey(newDirection ? key : null)
    setSortDirection(newDirection)

    if (onSort && newDirection) {
      onSort(key, newDirection)
    }
  }

  const handleFilter = (query: string) => {
    setFilterQuery(query)
    setCurrentPage(1)
    if (onFilter) {
      onFilter(query)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (onPageChange) {
      onPageChange(page)
    }
  }

  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data?.slice(startIndex, endIndex)

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-danger-600 font-medium">{error}</p>
        <Button variant="secondary" size="sm" className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (data?.length === 0 && !loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search..."
          value={filterQuery}
          onChange={(e) => handleFilter(e.target.value)}
          className="flex-1"
          aria-label="Search table data"
        />
      </div>

      {/* Table Container - Responsive */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table
          className="w-full text-sm"
          role="table"
          aria-label="Data table"
          aria-busy={loading}
        >
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left font-semibold text-neutral-700"
                  style={{ width: column.width }}
                  scope="col"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center gap-2 hover:text-primary-600 transition-colors"
                      aria-sort={
                        sortKey === String(column.key)
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      {column.label}
                      {sortKey === String(column.key) && (
                        <Icon
                          name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                          size={16}
                        />
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index} className="border-b border-neutral-200">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData?.length === 0 ? (
              <tr>
                <td colSpan={columns?.length} className="px-4 py-6 text-center text-neutral-500">
                  No results found
                </td>
              </tr>
            ) : (
              paginatedData?.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 text-neutral-700">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
