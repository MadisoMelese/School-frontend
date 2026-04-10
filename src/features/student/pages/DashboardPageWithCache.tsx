import React, { useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Dashboard, Widget } from '@components/organisms/Dashboard';
import { GradeCard } from '@components/organisms/GradeCard';
import { AttendanceCalendar } from '@components/organisms/AttendanceCalendar';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { useAuth } from '@hooks/useAuth';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useCachedDashboard } from '@hooks/useCachedDashboard';
import { useOfflineStore } from '@/store/offlineStore';

/**
 * Student Dashboard Page with Offline Caching
 * Displays role-specific widgets for students with offline support:
 * - Recent grades (cached)
 * - Attendance percentage (cached)
 * - Upcoming exams (cached)
 * - Pending fees (cached)
 * - Unread messages (cached)
 */

interface DashboardState {
  scrollPosition: number;
  lastUpdated: number;
}

export const StudentDashboardPageWithCache: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOfflineStore();
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    `dashboard-${user?.id}`,
    { scrollPosition: 0, lastUpdated: Date.now() }
  );

  // Use cached dashboard data
  const { data: dashboardData, loading, error, isFromCache, refetch } = useCachedDashboard();

  // Create widgets from dashboard data
  const widgets: Widget[] = React.useMemo(() => {
    if (!dashboardData) return [];

    return [
      {
        id: 'recent-grades',
        title: 'Recent Grades',
        type: 'card',
        size: 'large',
        content: (
          <div className="space-y-3">
            {dashboardData.grades.slice(0, 2).map((grade: any) => (
              <GradeCard
                key={grade.id}
                subject={grade.subject}
                marksObtained={grade.marksObtained}
                totalMarks={grade.totalMarks}
                grade={grade.grade}
                remarks={grade.remarks}
                examDate={new Date(grade.examDate)}
              />
            ))}
          </div>
        ),
      },
      {
        id: 'attendance',
        title: 'Attendance',
        type: 'chart',
        size: 'medium',
        content: (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Attendance Rate</span>
              <Badge variant="success" className="text-lg">
                {dashboardData.attendancePercentage}%
              </Badge>
            </div>
            <AttendanceCalendar
              attendanceData={dashboardData.attendance.map((a: any) => ({
                date: a.date,
                status: a.status,
              }))}
            />
          </div>
        ),
      },
      {
        id: 'upcoming-exams',
        title: 'Upcoming Exams',
        type: 'list',
        size: 'medium',
        content: (
          <div className="space-y-3">
            {dashboardData.exams.map((exam: any) => {
              const examDate = new Date(exam.date);
              const daysUntil = Math.ceil(
                (examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={exam.id}
                  className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg"
                >
                  <Icon
                    name="Calendar"
                    size={20}
                    className="text-primary-600 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900">{exam.subject}</p>
                    <p className="text-xs text-neutral-600 mt-1">
                      {examDate.toLocaleDateString()} at {exam.time}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{exam.hallLocation}</p>
                  </div>
                  {daysUntil <= 7 && (
                    <Badge variant="warning">In {daysUntil} days</Badge>
                  )}
                </div>
              );
            })}
          </div>
        ),
      },
      {
        id: 'fees',
        title: 'Fee Status',
        type: 'stats',
        size: 'medium',
        content: (
          <div className="space-y-3">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Fees</span>
                <span className="font-medium text-neutral-900">
                  ₹{dashboardData.feeSummary.totalFees}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-neutral-600">Paid</span>
                <span className="font-medium text-success">
                  ₹{dashboardData.feeSummary.totalPaid}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-neutral-600">Outstanding</span>
                <span className="font-medium text-danger">
                  ₹{dashboardData.feeSummary.outstandingBalance}
                </span>
              </div>
            </div>
            {dashboardData.fees.slice(0, 2).map((fee: any) => (
              <div
                key={fee.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-neutral-900">{fee.title}</p>
                  <p className="text-xs text-neutral-600">
                    ₹{fee.paidAmount} / ₹{fee.amount}
                  </p>
                </div>
                <Badge
                  variant={
                    fee.status === 'paid'
                      ? 'success'
                      : fee.status === 'pending'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {fee.status}
                </Badge>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'messages',
        title: 'Messages',
        type: 'list',
        size: 'medium',
        content: (
          <div className="space-y-3">
            {dashboardData.unreadMessageCount > 0 && (
              <div className="flex items-center justify-between p-2 bg-primary-50 rounded-lg">
                <span className="text-sm text-primary-900">Unread Messages</span>
                <Badge variant="info">{dashboardData.unreadMessageCount}</Badge>
              </div>
            )}
            {dashboardData.messages.map((msg: any) => (
              <div
                key={msg.id}
                className="p-3 bg-neutral-50 rounded-lg border-l-4 border-primary-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900">{msg.sender.name}</p>
                    <p className="text-sm text-neutral-700 mt-1 truncate">{msg.subject}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!msg.isRead && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ),
      },
    ];
  }, [dashboardData]);

  // Restore scroll position
  useEffect(() => {
    if (dashboardState?.scrollPosition) {
      window.scrollTo(0, dashboardState.scrollPosition);
    }
  }, [dashboardState]);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      setDashboardState({
        ...dashboardState,
        scrollPosition: window.scrollY,
        lastUpdated: Date.now(),
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dashboardState, setDashboardState]);

  return (
    <DashboardLayout
      title="Dashboard"
      description={
        isFromCache
          ? 'Viewing cached data (offline mode)'
          : 'Welcome back! Here\'s your academic overview.'
      }
    >
      {/* Offline indicator */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
          <Icon name="WifiOff" size={20} className="text-warning-600" />
          <span className="text-sm text-warning-900">
            You're offline. Showing cached data.
          </span>
        </div>
      )}

      {/* Cached data indicator */}
      {isFromCache && isOnline && (
        <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Database" size={20} className="text-info-600" />
            <span className="text-sm text-info-900">
              Showing cached data. Last updated: {new Date(dashboardState.lastUpdated).toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="text-sm text-info-600 hover:text-info-700 font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      <Dashboard widgets={widgets} loading={loading} error={error?.message} />
    </DashboardLayout>
  );
};

export default StudentDashboardPageWithCache;
