import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '../atoms/Icon'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  format?: string
  placeholder?: string
  id?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  format = 'YYYY-MM-DD',
  placeholder = 'Select a date',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const datePickerId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (!isDateDisabled(selectedDate)) {
      onChange(selectedDate)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={datePickerId}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2.5 text-base rounded-lg border-2 border-neutral-300 bg-white text-left flex items-center justify-between transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed min-h-[44px]"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onKeyDown={handleKeyDown}
      >
        <span className={value ? 'text-neutral-900' : 'text-neutral-500'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <Icon name="Calendar" size="md" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <h3 className="text-sm font-semibold text-neutral-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isSelected = value && date.toDateString() === value.toDateString()
              const isDisabled = isDateDisabled(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={`p-2 text-sm rounded-lg transition-colors min-h-[44px] flex items-center justify-center ${
                    isSelected
                      ? 'bg-primary-500 text-white font-medium'
                      : isToday
                        ? 'bg-primary-100 text-primary-900 font-medium'
                        : 'text-neutral-900 hover:bg-neutral-100'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
