import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PortalLayout } from '@/components/templates';
import { DataTable, AttendanceCalendar } from '@/components/organisms';
import { Card, Tabs } from '@/components/molecules';
import { Badge, Spinner } from '@/components/atoms';
import { parentService } from '@/services/api';
import { Attendance } from '@/types/api.types';
import { formatDate } from '@/utils/formatters';

export const ChildAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewType, setViewType] = useState<'table' | 'calendar'>('table');

  const childId = searchParams.get('childId') || '';

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['child-attendance', childId, selectedMonth],
    queryFn: () => {
      const [year, month] = selectedMonth.split('-');
      return parentService.getChildAttendance(childId, {
        month,
        year,
        limit: 100,
      });
    },
    enabled: !!childId,
  });

  const { data: percentageData, isLoading: percentageLoading } = useQuery({
    queryKey: ['child-attendance-percentage', childId],
    queryFn: () => parentService.getChildAttendancePercentage(childId),
    enabled: !!childId,
  });

  const isLoading = attendanceLoading || percentageLoading;

  const attendanceColumns = [
    {
      key: 'date' as const,
      label: 'Date',
      render: (value: string) => (
        <span className="font-medium">
          {formatDate(new Date(value), 'long')}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => {
        const variants: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
          present: 'success',
          absent: 'danger',
          late: 'warning',
          excused: 'info',
        };
        return (
          <Badge variant={variants[value] || 'info'}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'notes' as const,
      label: 'Notes',
      render: (value?: string) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {value || '-'}
        </span>
      ),
    },
  ];

  const attendanceSummary = attendanceData?.data
    ? {
        present: attendanceData.data.filter((a) => a.status === 'present').length,
        absent: attendanceData.data.filter((a) => a.status === 'absent').length,
        late: attendanceData.data.filter((a) => a.status === 'late').length,
        excused: attendanceData.data.filter((a) => a.status === 'excused').length,
      }
    : null;

  if (!childId) {
    return (
      <PortalLayout title="Child Attendance">
        <Card className="border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-950">
          <p className="text-danger-700 dark:text-danger-200">Please select a child first</p>
        </Card>
      </PortalLayout>
    );
  }

  if (isLoading) {
    return (
      <PortalLayout title="Child Attendance">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Child Attendance">
      <div className="space-y-6">
        {/* Attendance Percentage */}
        {percentageData && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Attendance Overview
              </h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-950">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Attendance Rate
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {(percentageData.percentage * 100).toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    {percentageData.term}
                  </p>
                </div>

                {attendanceSummary && (
                  <>
                    <div className="rounded-lg bg-success-50 p-4 dark:bg-success-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Present</p>
                      <p className="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">
                        {attendanceSummary.present}
                      </p>
                    </div>

                    <div className="rounded-lg bg-danger-50 p-4 dark:bg-danger-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Absent</p>
                      <p className="mt-1 text-2xl font-bold text-danger-600 dark:text-danger-400">
                        {attendanceSummary.absent}
                      </p>
                    </div>

                    <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-950">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Late</p>
                      <p className="mt-1 text-2xl font-bold text-warning-600 dark:text-warning-400">
                        {attendanceSummary.late}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {percentageData.percentage < 0.75 && (
                <div className="rounded-lg border-l-4 border-danger-500 bg-danger-50 p-4 dark:bg-danger-950">
                  <p className="text-sm font-medium text-danger-700 dark:text-danger-200">
                    ⚠️ Attendance is below 75%. Please ensure regular attendance.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* View Type Selector */}
        <Card>
          <Tabs
            tabs={[
              { id: 'table', label: 'Table View', content: null },
              { id: 'calendar', label: 'Calendar View', content: null },
            ]}
            activeTab={viewType}
            onChange={(tab: string) => setViewType(tab as 'table' | 'calendar')}
          />
        </Card>

        {/* Month Selector */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Select Month
            </h3>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800"
            />
          </div>
        </Card>

        {/* Attendance Data */}
        {viewType === 'table' ? (
          attendanceData?.data && attendanceData.data.length > 0 ? (
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Attendance Records ({attendanceData.data.length})
                </h3>

                <DataTable
                  columns={attendanceColumns}
                  data={attendanceData.data}
                  pageSize={10}
                />
              </div>
            </Card>
          ) : (
            <Card className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400">
                No attendance records found for this month
              </p>
            </Card>
          )
        ) : (
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Calendar View
              </h3>

              {attendanceData?.data ? (
                <AttendanceCalendar
                  attendanceData={attendanceData.data}
                  month={new Date(selectedMonth)}
                />
              ) : (
                <p className="text-center text-neutral-600 dark:text-neutral-400">
                  No attendance data available
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default ChildAttendancePage;
