import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Card } from '@components/molecules/Card';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { Spinner } from '@components/atoms/Spinner';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { studentService } from '@services/api/studentService';
import type { Attendance } from '@types';

/**
 * Student Attendance Page
 * Displays student attendance records with calendar view, filtering, and summary
 * - Calendar view on desktop showing status for each day
 * - Month filtering
 * - Attendance percentage calculation
 * - Warning indicator when attendance < 75%
 * - Color coding (green/red/yellow/gray for status)
 * - Summary showing total present, absent, late, excused
 * - Date, status, and teacher notes display
 */

interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendancePercentage: number;
}

interface AttendanceByDate {
  [date: string]: Attendance;
}

const getStatusColor = (status: string): 'success' | 'danger' | 'warning' | 'neutral' => {
  switch (status) {
    case 'present':
      return 'success';
    case 'absent':
      return 'danger';
    case 'late':
      return 'warning';
    case 'excused':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const AttendancePage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);

  // Load attendance data
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch attendance records for the current month
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();

        const response = await studentService.getAttendance({
          month: `${year}-${month}`,
          year: String(year),
        });

        setAttendance(response.data || []);

        // Fetch attendance percentage
        const percentageData = await studentService.getAttendancePercentage();

        // Calculate summary
        const summary = calculateSummary(response.data || [], percentageData.percentage);
        setAttendanceSummary(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [currentDate]);

  // Calculate attendance summary
  const calculateSummary = (records: Attendance[], percentage: number): AttendanceSummary => {
    const summary = {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalExcused: 0,
      attendancePercentage: percentage,
    };

    records.forEach((record) => {
      switch (record.status) {
        case 'present':
          summary.totalPresent++;
          break;
        case 'absent':
          summary.totalAbsent++;
          break;
        case 'late':
          summary.totalLate++;
          break;
        case 'excused':
          summary.totalExcused++;
          break;
      }
    });

    return summary;
  };

  // Create attendance map by date for quick lookup
  const attendanceByDate = useMemo(() => {
    const map: AttendanceByDate = {};
    attendance.forEach((record) => {
      const dateKey = formatDateKey(new Date(record.date));
      map[dateKey] = record;
    });
    return map;
  }, [attendance]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  // Handle month navigation
  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }, [currentDate]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }, [currentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Get attendance for a specific day
  const getAttendanceForDay = (day: number): Attendance | null => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = formatDateKey(date);
    return attendanceByDate[dateKey] || null;
  };

  // Get list of attendance records for the month
  const attendanceList = useMemo(() => {
    return attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance]);

  if (loading) {
    return (
      <DashboardLayout title="Attendance" description="View your attendance records">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Attendance" description="View your attendance records">
      <div className="space-y-6">
        {/* Attendance Summary Cards */}
        {attendanceSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Attendance Percentage */}
            <Card
              className={`${
                attendanceSummary.attendancePercentage < 75
                  ? 'border-2 border-danger-300 bg-danger-50'
                  : ''
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {attendanceSummary.attendancePercentage < 75 && (
                    <Icon name="AlertCircle" size={20} className="text-danger-600 mr-2" />
                  )}
                  <p className="text-sm text-neutral-600">Attendance %</p>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    attendanceSummary.attendancePercentage >= 75
                      ? 'text-success-600'
                      : 'text-danger-600'
                  }`}
                >
                  {attendanceSummary.attendancePercentage.toFixed(1)}%
                </p>
                {attendanceSummary.attendancePercentage < 75 && (
                  <p className="text-xs text-danger-600 mt-2 font-medium">Below 75%</p>
                )}
              </div>
            </Card>

            {/* Present */}
            <Card>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-success-500 mr-2" />
                  <p className="text-sm text-neutral-600">Present</p>
                </div>
                <p className="text-3xl font-bold text-success-600">
                  {attendanceSummary.totalPresent}
                </p>
              </div>
            </Card>

            {/* Absent */}
            <Card>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-danger-500 mr-2" />
                  <p className="text-sm text-neutral-600">Absent</p>
                </div>
                <p className="text-3xl font-bold text-danger-600">
                  {attendanceSummary.totalAbsent}
                </p>
              </div>
            </Card>

            {/* Late */}
            <Card>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-warning-500 mr-2" />
                  <p className="text-sm text-neutral-600">Late</p>
                </div>
                <p className="text-3xl font-bold text-warning-600">{attendanceSummary.totalLate}</p>
              </div>
            </Card>

            {/* Excused */}
            <Card>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-neutral-400 mr-2" />
                  <p className="text-sm text-neutral-600">Excused</p>
                </div>
                <p className="text-3xl font-bold text-neutral-600">
                  {attendanceSummary.totalExcused}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Calendar View (Desktop) */}
        {!isMobile && (
          <Card>
            <div className="space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePreviousMonth}
                    aria-label="Previous month"
                  >
                    <Icon name="ChevronLeft" size={18} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleToday}
                    aria-label="Go to today"
                  >
                    Today
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                  >
                    <Icon name="ChevronRight" size={18} />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-semibold text-neutral-600 text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const attendanceRecord = getAttendanceForDay(day);
                    const status = attendanceRecord?.status || null;

                    return (
                      <div
                        key={day}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                          status === 'present'
                            ? 'bg-success-50 border-success-300'
                            : status === 'absent'
                              ? 'bg-danger-50 border-danger-300'
                              : status === 'late'
                                ? 'bg-warning-50 border-warning-300'
                                : status === 'excused'
                                  ? 'bg-neutral-50 border-neutral-300'
                                  : 'bg-neutral-50 border-neutral-200'
                        }`}
                        title={
                          attendanceRecord
                            ? `${getStatusLabel(status || 'unknown')}: ${attendanceRecord.notes || 'No notes'}`
                            : `No record for day ${day}`
                        }
                      >
                        <p className="font-semibold text-neutral-900">{day}</p>
                        {status && (
                          <p
                            className={`text-xs font-medium mt-1 ${
                              status === 'present'
                                ? 'text-success-700'
                                : status === 'absent'
                                  ? 'text-danger-700'
                                  : status === 'late'
                                    ? 'text-warning-700'
                                    : 'text-neutral-700'
                            }`}
                          >
                            {status === 'present'
                              ? '✓'
                              : status === 'absent'
                                ? '✗'
                                : status === 'late'
                                  ? '⏱'
                                  : '○'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                  <span className="text-sm text-neutral-600">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger-500" />
                  <span className="text-sm text-neutral-600">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning-500" />
                  <span className="text-sm text-neutral-600">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neutral-400" />
                  <span className="text-sm text-neutral-600">Excused</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Attendance List View */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">
                {isMobile ? 'Attendance Records' : 'Detailed Records'}
              </h3>
              {!isMobile && (
                <p className="text-sm text-neutral-600">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {error ? (
              <div className="text-center py-8">
                <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
                <p className="text-danger-600 font-medium">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : attendanceList.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Calendar" size={32} className="text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No attendance records for this month</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceList.map((record) => (
                  <div
                    key={record.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-l-4 transition-all ${
                      record.status === 'present'
                        ? 'bg-success-50 border-success-500'
                        : record.status === 'absent'
                          ? 'bg-danger-50 border-danger-500'
                          : record.status === 'late'
                            ? 'bg-warning-50 border-warning-500'
                            : 'bg-neutral-50 border-neutral-400'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {record.status === 'present' && (
                        <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center">
                          <Icon name="Check" size={18} className="text-white" />
                        </div>
                      )}
                      {record.status === 'absent' && (
                        <div className="w-8 h-8 rounded-full bg-danger-500 flex items-center justify-center">
                          <Icon name="X" size={18} className="text-white" />
                        </div>
                      )}
                      {record.status === 'late' && (
                        <div className="w-8 h-8 rounded-full bg-warning-500 flex items-center justify-center">
                          <Icon name="Clock" size={18} className="text-white" />
                        </div>
                      )}
                      {record.status === 'excused' && (
                        <div className="w-8 h-8 rounded-full bg-neutral-400 flex items-center justify-center">
                          <Icon name="Info" size={18} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-neutral-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <Badge variant={getStatusColor(record.status)} size="sm">
                          {getStatusLabel(record.status)}
                        </Badge>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-neutral-600 mt-2">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;
