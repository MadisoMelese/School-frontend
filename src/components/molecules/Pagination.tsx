import React from 'react'
import { Icon } from '../atoms/Icon'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
  showInfo?: boolean
  maxVisiblePages?: number
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
  showInfo = true,
  maxVisiblePages = 5,
  className,
}) => {
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    if (currentPage - halfVisible < 1) {
      endPage = Math.min(totalPages, endPage + (halfVisible - currentPage + 1))
    }
    if (currentPage + halfVisible > totalPages) {
      startPage = Math.max(1, startPage - (currentPage + halfVisible - totalPages))
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const handleKeyDown = (e: React.KeyboardEvent, page: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange(page)
    }
  }

  const pageNumbers = getPageNumbers()
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <nav
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className || ''}`}
      aria-label="Pagination"
    >
      {/* Info */}
      {showInfo && (
        <div className="text-sm text-neutral-600">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => canGoPrev && onChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="p-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous page"
        >
          <Icon name="ChevronLeft" size="md" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-neutral-500">
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage

            return (
              <button
                key={pageNum}
                onClick={() => onChange(pageNum)}
                onKeyDown={(e) => handleKeyDown(e, pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[44px] h-[44px] rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => canGoNext && onChange(currentPage + 1)}
          disabled={!canGoNext}
          className="p-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next page"
        >
          <Icon name="ChevronRight" size="md" />
        </button>
      </div>
    </nav>
  )
}
