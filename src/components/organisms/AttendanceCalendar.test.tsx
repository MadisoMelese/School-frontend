import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AttendanceCalendar } from './AttendanceCalendar'

describe('AttendanceCalendar Component', () => {
  const mockAttendanceData = [
    { date: new Date('2024-01-01'), status: 'present' as const },
    { date: new Date('2024-01-02'), status: 'absent' as const },
    { date: new Date('2024-01-03'), status: 'late' as const, notes: 'Traffic jam' },
    { date: new Date('2024-01-04'), status: 'excused' as const },
  ]

  it('renders attendance calendar', () => {
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
      />
    )

    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('displays attendance statistics', () => {
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
      />
    )

    expect(screen.getByText('Present')).toBeInTheDocument()
    expect(screen.getByText('Absent')).toBeInTheDocument()
    expect(screen.getByText('Late')).toBeInTheDocument()
    expect(screen.getByText('Excused')).toBeInTheDocument()
  })

  it('calculates attendance percentage correctly', () => {
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
      />
    )

    // 1 present out of 4 = 25%
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('displays calendar days with correct status colors', () => {
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
      />
    )

    const presentDay = screen.getByRole('gridcell', { name: /1 present/i })
    expect(presentDay).toHaveClass('bg-success-100')
  })

  it('navigates to previous month', () => {
    const onMonthChange = vi.fn()
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
        onMonthChange={onMonthChange}
      />
    )

    const prevButton = screen.getByLabelText('Previous month')
    fireEvent.click(prevButton)

    expect(onMonthChange).toHaveBeenCalled()
  })

  it('navigates to next month', () => {
    const onMonthChange = vi.fn()
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
        onMonthChange={onMonthChange}
      />
    )

    const nextButton = screen.getByLabelText('Next month')
    fireEvent.click(nextButton)

    expect(onMonthChange).toHaveBeenCalled()
  })

  it('displays legend with status colors', () => {
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
      />
    )

    expect(screen.getByText('Present')).toBeInTheDocument()
    expect(screen.getByText('Absent')).toBeInTheDocument()
    expect(screen.getByText('Late')).toBeInTheDocument()
    expect(screen.getByText('Excused')).toBeInTheDocument()
  })

  it('displays notes on hover', () => {
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
      />
    )

    const lateDay = screen.getByRole('gridcell', { name: /3 late/i })
    expect(lateDay).toHaveAttribute('title', 'Traffic jam')
  })

  it('has proper accessibility attributes', () => {
    render(
      <AttendanceCalendar
        attendanceData={mockAttendanceData}
        month={new Date('2024-01-01')}
      />
    )

    const gridcells = screen.getAllByRole('gridcell')
    expect(gridcells.length).toBeGreaterThan(0)
  })

  it('handles empty attendance data', () => {
    render(
      <AttendanceCalendar
        attendanceData={[]}
        month={new Date('2024-01-01')}
      />
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
