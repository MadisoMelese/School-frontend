import React, { useState, useMemo } from 'react'
import { Button } from '../atoms/Button'
import { Icon } from '../atoms/Icon'
import { Badge } from '../atoms/Badge'

export interface AttendanceRecord {
  date: Date | string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

export interface AttendanceCalendarProps {
  attendanceData: AttendanceRecord[]
  month?: Date
  onMonthChange?: (month: Date) => void
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'present':
      return 'bg-success-100 border-success-300 text-success-700'
    case 'absent':
      return 'bg-danger-100 border-danger-300 text-danger-700'
    case 'late':
      return 'bg-warning-100 border-warning-300 text-warning-700'
    case 'excused':
      return 'bg-neutral-100 border-neutral-300 text-neutral-700'
    default:
      return 'bg-neutral-50 border-neutral-200 text-neutral-500'
  }
}

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'present':
      return 'CheckCircle'
    case 'absent':
      return 'XCircle'
    case 'late':
      return 'Clock'
    case 'excused':
      return 'HelpCircle'
    default:
      return 'Circle'
  }
}

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendanceData,
  month = new Date(),
  onMonthChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(month))

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
    if (onMonthChange) {
      onMonthChange(newMonth)
    }
  }

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
    if (onMonthChange) {
      onMonthChange(newMonth)
    }
  }

  // Create attendance map for quick lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    attendanceData.forEach((record) => {
      const date = new Date(record.date)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      map.set(key, record)
    })
    return map
  }, [attendanceData])

  // Calculate statistics
  const stats = useMemo(() => {
    const present = attendanceData.filter((r) => r.status === 'present').length
    const absent = attendanceData.filter((r) => r.status === 'absent').length
    const late = attendanceData.filter((r) => r.status === 'late').length
    const excused = attendanceData.filter((r) => r.status === 'excused').length
    const total = attendanceData.length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return { present, absent, late, excused, total, percentage }
  }, [attendanceData])

  // Get calendar days
  const year = currentMonth.getFullYear()
  const month_num = currentMonth.getMonth()
  const firstDay = new Date(year, month_num, 1)
  const lastDay = new Date(year, month_num + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-success-50 border border-success-200 rounded-lg p-3">
          <p className="text-xs text-success-600 font-medium">Present</p>
          <p className="text-lg font-bold text-success-700">{stats.present}</p>
        </div>
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
          <p className="text-xs text-danger-600 font-medium">Absent</p>
          <p className="text-lg font-bold text-danger-700">{stats.absent}</p>
        </div>
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
          <p className="text-xs text-warning-600 font-medium">Late</p>
          <p className="text-lg font-bold text-warning-700">{stats.late}</p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
          <p className="text-xs text-neutral-600 font-medium">Excused</p>
          <p className="text-lg font-bold text-neutral-700">{stats.excused}</p>
        </div>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <p className="text-xs text-primary-600 font-medium">Percentage</p>
          <p className="text-lg font-bold text-primary-700">{stats.percentage}%</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-neutral-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const date = new Date(year, month_num, day)
              const dateKey = `${year}-${month_num}-${day}`
              const record = attendanceMap.get(dateKey)

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg border-2 transition-all ${
                    record
                      ? getStatusColor(record.status)
                      : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}
                  role="gridcell"
                  aria-label={`${day} ${getStatusLabel(record?.status || 'no data')}`}
                  title={record?.notes || ''}
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold">{day}</p>
                    {record && (
                      <Icon name={getStatusIcon(record.status) as keyof typeof import('lucide-react')} size={14} className="mx-auto mt-1" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success-100 border border-success-300 rounded" />
          <span className="text-neutral-700">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-danger-100 border border-danger-300 rounded" />
          <span className="text-neutral-700">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-warning-100 border border-warning-300 rounded" />
          <span className="text-neutral-700">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-100 border border-neutral-300 rounded" />
          <span className="text-neutral-700">Excused</span>
        </div>
      </div>
    </div>
  )
}
