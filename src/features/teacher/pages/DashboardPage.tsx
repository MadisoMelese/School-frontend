import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Dashboard, Widget } from '@components/organisms/Dashboard';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { useAuth } from '@hooks/useAuth';
import { useLocalStorage } from '@hooks/useLocalStorage';

/**
 * Teacher Dashboard Page
 * Displays role-specific widgets for teachers:
 * - Assigned classes
 * - Pending grading tasks
 * - Today's attendance marking
 * - Recent messages
 */

interface DashboardState {
  scrollPosition: number;
  lastUpdated: number;
}

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    `dashboard-${user?.id}`,
    { scrollPosition: 0, lastUpdated: Date.now() }
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Mock data - replace with actual API calls
  const mockClasses = [
    {
      id: '1',
      name: 'Class 10-A',
      gradeLevel: '10',
      section: 'A',
      studentCount: 35,
      schedule: [],
    },
    {
      id: '2',
      name: 'Class 10-B',
      gradeLevel: '10',
      section: 'B',
      studentCount: 32,
      schedule: [],
    },
    {
      id: '3',
      name: 'Class 9-A',
      gradeLevel: '9',
      section: 'A',
      studentCount: 38,
      schedule: [],
    },
  ];

  const mockGradingTasks = [
    {
      id: '1',
      examName: 'Mid-term Exam',
      subject: 'Mathematics',
      className: 'Class 10-A',
      studentCount: 35,
      gradedCount: 20,
      dueDate: '2024-01-25',
    },
    {
      id: '2',
      examName: 'Mid-term Exam',
      subject: 'Mathematics',
      className: 'Class 10-B',
      studentCount: 32,
      gradedCount: 15,
      dueDate: '2024-01-25',
    },
  ];

  const mockAttendanceClasses = [
    {
      id: '1',
      className: 'Class 10-A',
      time: '09:00 AM',
      status: 'pending',
    },
    {
      id: '2',
      className: 'Class 10-B',
      time: '10:30 AM',
      status: 'completed',
    },
  ];

  const mockMessages = [
    {
      id: '1',
      senderName: 'Principal',
      subject: 'Staff Meeting Tomorrow',
      preview: 'Please attend the staff meeting...',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
    {
      id: '2',
      senderName: 'Parent - John Smith',
      subject: 'Regarding exam results',
      preview: 'Could you please explain...',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
  ];

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Create widgets
        const dashboardWidgets: Widget[] = [
          {
            id: 'assigned-classes',
            title: 'Assigned Classes',
            type: 'list',
            size: 'large',
            content: (
              <div className="space-y-3">
                {mockClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">{cls.name}</p>
                      <p className="text-sm text-neutral-600 mt-1">{cls.studentCount} students</p>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-neutral-400" />
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'grading-tasks',
            title: 'Pending Grading',
            type: 'stats',
            size: 'medium',
            content: (
              <div className="space-y-3">
                {mockGradingTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-neutral-900">{task.className}</p>
                        <p className="text-xs text-neutral-600">{task.subject}</p>
                      </div>
                      <Badge variant="warning">
                        {task.gradedCount}/{task.studentCount}
                      </Badge>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-warning-500 transition-all"
                        style={{
                          width: `${(task.gradedCount / task.studentCount) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'attendance-marking',
            title: "Today's Attendance",
            type: 'list',
            size: 'medium',
            content: (
              <div className="space-y-3">
                {mockAttendanceClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{cls.className}</p>
                      <p className="text-xs text-neutral-600">{cls.time}</p>
                    </div>
                    <Badge variant={cls.status === 'completed' ? 'success' : 'warning'}>
                      {cls.status === 'completed' ? 'Done' : 'Pending'}
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
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      msg.isRead
                        ? 'bg-neutral-50 border-neutral-300'
                        : 'bg-blue-50 border-primary-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900">{msg.senderName}</p>
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

        setWidgets(dashboardWidgets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

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
    <DashboardLayout title="Dashboard" description="Welcome! Here's your teaching overview.">
      <Dashboard widgets={widgets} loading={loading} error={error || undefined} />
    </DashboardLayout>
  );
};

export default TeacherDashboardPage;
