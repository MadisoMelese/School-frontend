import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Card } from '@components/molecules/Card';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { Spinner } from '@components/atoms/Spinner';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { studentService } from '@services/api/studentService';
import type { Timetable } from '@types';
import { formatTime, getDayNameFromNumber, isToday, isCurrentOrUpcoming } from '@utils/dateHelpers';

/**
 * Student Timetable Page
 * Displays weekly class schedule with navigation and calendar export
 * - Weekly grid view showing all classes
 * - Week navigation (previous, next, today buttons)
 * - Current day highlighting
 * - Class details (name, subject, teacher, time, location)
 * - Visual indicator for approaching classes (30 min)
 * - Calendar export (iCalendar format)
 * - Responsive day view on mobile
 */

interface TimetableWithStatus extends Timetable {
  isToday: boolean;
  isCurrentOrUpcoming: boolean;
  minutesUntilStart?: number;
}

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  date: Date;
  classes: TimetableWithStatus[];
  isToday: boolean;
}

export const TimetablePage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State
  const [timetable, setTimetable] = useState<TimetableWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Load timetable data
  useEffect(() => {
    const loadTimetable = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get week string for API (ISO week format)
        const weekStart = getWeekStart(currentDate);
        const weekString = weekStart.toISOString().split('T')[0];

        const data = await studentService.getTimetable({ week: weekString });

        // Enrich with status information
        const enrichedData: TimetableWithStatus[] = data.map((item) => {
          const classDate = getClassDate(currentDate, item.dayOfWeek);
          const isClassToday = isToday(classDate);
          const isUpcoming = isCurrentOrUpcoming(classDate, item.startTime);
          const minutesUntil = getMinutesUntilClass(classDate, item.startTime);

          return {
            ...item,
            isToday: isClassToday,
            isCurrentOrUpcoming: isUpcoming,
            minutesUntilStart: minutesUntil,
          };
        });

        setTimetable(enrichedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, [currentDate]);

  // Get week schedule organized by day
  const weekSchedule = useMemo(() => {
    const weekStart = getWeekStart(currentDate);
    const schedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();

      const dayClasses = timetable.filter((t) => t.dayOfWeek === dayOfWeek);

      schedule.push({
        dayOfWeek,
        dayName: getDayNameFromNumber(dayOfWeek),
        date,
        classes: dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)),
        isToday: isToday(date),
      });
    }

    return schedule;
  }, [timetable, currentDate]);

  // Handle week navigation
  const handlePreviousWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
    setSelectedDay(null);
  }, [currentDate]);

  const handleNextWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
    setSelectedDay(null);
  }, [currentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  }, []);

  // Handle calendar export
  const handleExportCalendar = useCallback(() => {
    const icsContent = generateICalendar(timetable, currentDate);
    downloadICalendar(icsContent);
  }, [timetable, currentDate]);

  // Format week display
  const weekStart = getWeekStart(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekLabel = `${weekStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${weekEnd.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  if (loading) {
    return (
      <DashboardLayout title="Timetable" description="View your weekly class schedule">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Timetable" description="View your weekly class schedule">
      <div className="space-y-6">
        {/* Week Navigation */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Week of {weekLabel}</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCalendar}
                className="flex items-center gap-2"
                disabled={timetable.length === 0}
              >
                <Icon name="Download" size={16} />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePreviousWeek}
                className="flex items-center gap-2"
              >
                <Icon name="ChevronLeft" size={16} />
                Previous
              </Button>

              <Button variant="secondary" size="sm" onClick={handleToday} className="flex-1">
                Today
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextWeek}
                className="flex items-center gap-2"
              >
                Next
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card>
            <div className="text-center py-8">
              <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
              <p className="text-danger-600 font-medium">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => setCurrentDate(new Date())}
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!error && timetable.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <Icon name="Calendar" size={32} className="text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">No classes scheduled for this week</p>
            </div>
          </Card>
        )}

        {/* Timetable Display */}
        {!error && timetable.length > 0 && (
          <>
            {isMobile ? (
              // Mobile: Day View
              <MobileDayView
                weekSchedule={weekSchedule}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />
            ) : (
              // Desktop: Weekly Grid View
              <DesktopWeeklyView weekSchedule={weekSchedule} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

/**
 * Desktop Weekly Grid View
 */
interface DesktopWeeklyViewProps {
  weekSchedule: DaySchedule[];
}

const DesktopWeeklyView: React.FC<DesktopWeeklyViewProps> = ({ weekSchedule }) => {
  return (
    <div className="grid grid-cols-7 gap-2">
      {weekSchedule.map((day) => (
        <div key={day.dayOfWeek} className="space-y-2">
          {/* Day Header */}
          <div
            className={`p-3 rounded-lg text-center ${
              day.isToday
                ? 'bg-primary-100 border-2 border-primary-600'
                : 'bg-neutral-100 border border-neutral-200'
            }`}
          >
            <p className="text-xs font-semibold text-neutral-600 uppercase">{day.dayName}</p>
            <p
              className={`text-sm font-bold ${day.isToday ? 'text-primary-600' : 'text-neutral-900'}`}
            >
              {day.date.getDate()}
            </p>
          </div>

          {/* Classes */}
          <div className="space-y-2 min-h-[200px]">
            {day.classes.length === 0 ? (
              <div className="text-center py-4 text-neutral-400 text-xs">No classes</div>
            ) : (
              day.classes.map((classItem) => <ClassCard key={classItem.id} classItem={classItem} />)
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Mobile Day View
 */
interface MobileDayViewProps {
  weekSchedule: DaySchedule[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

const MobileDayView: React.FC<MobileDayViewProps> = ({
  weekSchedule,
  selectedDay,
  onSelectDay,
}) => {
  const todaySchedule = weekSchedule.find((d) => d.isToday);
  const displaySchedule = selectedDay !== null ? weekSchedule[selectedDay] : todaySchedule;

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 pb-2">
          {weekSchedule.map((day, index) => (
            <button
              key={day.dayOfWeek}
              onClick={() => onSelectDay(index)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-center transition-colors ${
                selectedDay === index || (selectedDay === null && day.isToday)
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              <p className="text-xs font-semibold uppercase">{day.dayName}</p>
              <p className="text-sm font-bold">{day.date.getDate()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Classes */}
      {displaySchedule && (
        <div className="space-y-3">
          <h3 className="font-semibold text-neutral-900">
            {displaySchedule.dayName},{' '}
            {displaySchedule.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </h3>

          {displaySchedule.classes.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Icon name="Calendar" size={32} className="text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No classes scheduled</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {displaySchedule.classes.map((classItem) => (
                <ClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Class Card Component
 */
interface ClassCardProps {
  classItem: TimetableWithStatus;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem }) => {
  const isApproaching =
    classItem.isCurrentOrUpcoming &&
    classItem.minutesUntilStart !== undefined &&
    classItem.minutesUntilStart <= 30;

  return (
    <Card className={`${isApproaching ? 'border-l-4 border-l-warning-600 bg-warning-50' : ''}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-900 truncate">{classItem.className}</h4>
            <p className="text-sm text-neutral-600">{classItem.subject}</p>
          </div>

          {isApproaching && (
            <Badge variant="warning" size="sm" className="flex-shrink-0">
              <Icon name="AlertCircle" size={14} />
              Soon
            </Badge>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <Icon name="User" size={16} className="flex-shrink-0" />
            <span className="truncate">{classItem.teacherName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Icon name="Clock" size={16} className="flex-shrink-0" />
            <span>
              {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={16} className="flex-shrink-0" />
            <span className="truncate">{classItem.roomNumber}</span>
          </div>
        </div>

        {/* Approaching Indicator */}
        {isApproaching && classItem.minutesUntilStart !== undefined && (
          <div className="bg-warning-100 border border-warning-300 rounded p-2 text-xs font-medium text-warning-900">
            Starting in {classItem.minutesUntilStart} minute
            {classItem.minutesUntilStart !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Utility Functions
 */

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getClassDate(weekStart: Date, dayOfWeek: number): Date {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayOfWeek);
  return date;
}

function getMinutesUntilClass(classDate: Date, startTime: string): number {
  const now = new Date();
  const [hours, minutes] = startTime.split(':').map(Number);

  const classDateTime = new Date(classDate);
  classDateTime.setHours(hours, minutes, 0, 0);

  const diffMs = classDateTime.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60));
}

function generateICalendar(timetable: TimetableWithStatus[], weekStart: Date): string {
  const weekStartDate = getWeekStart(weekStart);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SchoolOS//Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  timetable.forEach((item) => {
    const classDate = getClassDate(weekStartDate, item.dayOfWeek);
    const [startHours, startMinutes] = item.startTime.split(':').map(Number);
    const [endHours, endMinutes] = item.endTime.split(':').map(Number);

    const startDateTime = new Date(classDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(classDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const dtStart = formatICalendarDate(startDateTime);
    const dtEnd = formatICalendarDate(endDateTime);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${item.id}@schoolos.local`,
      `DTSTAMP:${formatICalendarDate(new Date())}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${item.className} - ${item.subject}`,
      `DESCRIPTION:Teacher: ${item.teacherName}\\nLocation: ${item.roomNumber}`,
      `LOCATION:${item.roomNumber}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatICalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function downloadICalendar(content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `timetable-${new Date().toISOString().split('T')[0]}.ics`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default TimetablePage;
