import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Dashboard, Widget } from '@components/organisms/Dashboard';
import { GradeCard } from '@components/organisms/GradeCard';
import { AttendanceCalendar } from '@components/organisms/AttendanceCalendar';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { useAuth } from '@hooks/useAuth';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useCachedDashboard } from '@hooks/useCachedDashboard';
import { useOffline } from '@hooks/useOffline';

/**
 * Student Dashboard Page
 * Displays role-specific widgets for students:
 * - Recent grades
 * - Attendance percentage
 * - Upcoming exams
 * - Pending fees
 * - Unread messages
 */

interface DashboardState {
  scrollPosition: number;
  lastUpdated: number;
}

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    `dashboard-${user?.id}`,
    { scrollPosition: 0, lastUpdated: Date.now() }
  );

  // Use cached dashboard data
  const { data: dashboardData, loading, error: fetchError, isFromCache } = useCachedDashboard();

  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Create widgets from dashboard data
  useEffect(() => {
    if (!dashboardData) return;

    const dashboardWidgets: Widget[] = [
      {
        id: 'recent-grades',
        title: 'Recent Grades',
        type: 'card',
        size: 'large',
        content: (
          <div className="space-y-3">
            {Array.isArray(dashboardData.grades) && dashboardData.grades.length > 0 ? (
              dashboardData.grades.slice(0, 2).map((grade: any) => (
                <GradeCard key={grade._id || grade.id || grade.subject} {...grade} />
              ))
            ) : (
              <p className="text-sm text-neutral-500">No grades available yet</p>
            )}
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
              <Badge
                variant={dashboardData.attendancePercentage >= 75 ? 'success' : 'warning'}
                className="text-lg"
              >
                {dashboardData.attendancePercentage}%
              </Badge>
            </div>
            {Array.isArray(dashboardData.attendance) && dashboardData.attendance.length > 0 ? (
              <AttendanceCalendar
                attendanceData={dashboardData.attendance.map((a: any) => ({
                  date: a.date,
                  status: a.status,
                }))}
              />
            ) : (
              <p className="text-sm text-neutral-500">No attendance records available</p>
            )}
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
            {Array.isArray(dashboardData.exams) && dashboardData.exams.length > 0 ? (
              dashboardData.exams.map((exam: any) => {
                const examDate = new Date(exam.date);
                const daysUntil = Math.ceil(
                  (examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={exam._id || exam.id}
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
                        {examDate.toLocaleDateString()} at {exam.startTime}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{exam.title}</p>
                    </div>
                    {daysUntil <= 7 && (
                      <Badge variant="warning">In {daysUntil} days</Badge>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-neutral-500">No upcoming exams</p>
            )}
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
            {Array.isArray(dashboardData.fees) && dashboardData.fees.length > 0 ? (
              dashboardData.fees.map((fee: any) => (
                <div
                  key={fee._id || fee.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{fee.title || fee.description}</p>
                    <p className="text-xs text-neutral-600">
                      ₹{fee.paidAmount || 0} / ₹{fee.amount}
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
              ))
            ) : (
              <p className="text-sm text-neutral-500">No fees available</p>
            )}
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
            {Array.isArray(dashboardData.messages) && dashboardData.messages.length > 0 ? (
              dashboardData.messages.map((msg: any) => {
                const senderName = msg.senderId?.firstName 
                  ? `${msg.senderId.firstName} ${msg.senderId.lastName || ''}`.trim()
                  : 'Unknown Sender';
                return (
                  <div
                    key={msg._id || msg.id}
                    className="p-3 bg-neutral-50 rounded-lg border-l-4 border-primary-500"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900">{senderName}</p>
                        <p className="text-sm text-neutral-700 mt-1 truncate">{msg.subject}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!msg.isRead && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-neutral-500">No messages</p>
            )}
          </div>
        ),
      },
    ];

    setWidgets(dashboardWidgets);
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
          ? 'Showing cached data (offline mode)'
          : 'Welcome back! Here\'s your academic overview.'
      }
    >
      {!isOnline && (
        <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
          <Icon name="WifiOff" size={20} className="text-warning-600" />
          <span className="text-sm text-warning-800">
            You're offline. Showing cached data.
          </span>
        </div>
      )}
      <Dashboard widgets={widgets} loading={loading} error={fetchError?.message} />
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
