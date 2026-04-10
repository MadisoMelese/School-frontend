import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Dashboard, Widget } from '@components/organisms/Dashboard';
import { GradeCard } from '@components/organisms/GradeCard';
import { AttendanceCalendar } from '@components/organisms/AttendanceCalendar';
import { Card } from '@components/molecules/Card';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { useAuth } from '@hooks/useAuth';
import { useLocalStorage } from '@hooks/useLocalStorage';

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
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    `dashboard-${user?.id}`,
    { scrollPosition: 0, lastUpdated: Date.now() }
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Mock data - replace with actual API calls
  const mockGrades = [
    {
      subject: 'Mathematics',
      marksObtained: 85,
      totalMarks: 100,
      grade: 'A',
      remarks: 'Good performance',
      examDate: new Date('2024-01-15'),
    },
    {
      subject: 'English',
      marksObtained: 78,
      totalMarks: 100,
      grade: 'B+',
      remarks: 'Needs improvement in writing',
      examDate: new Date('2024-01-16'),
    },
    {
      subject: 'Science',
      marksObtained: 92,
      totalMarks: 100,
      grade: 'A+',
      remarks: 'Excellent work',
      examDate: new Date('2024-01-17'),
    },
  ];

  const mockAttendance = [
    { date: '2024-01-15', status: 'present' as const },
    { date: '2024-01-16', status: 'present' as const },
    { date: '2024-01-17', status: 'absent' as const },
    { date: '2024-01-18', status: 'late' as const },
    { date: '2024-01-19', status: 'present' as const },
  ];

  const mockExams = [
    {
      id: '1',
      name: 'Mid-term Exam',
      subject: 'Mathematics',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      time: '09:00 AM',
      totalMarks: 100,
      hallLocation: 'Hall A',
    },
    {
      id: '2',
      name: 'Mid-term Exam',
      subject: 'English',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      time: '02:00 PM',
      totalMarks: 100,
      hallLocation: 'Hall B',
    },
  ];

  const mockFees = [
    {
      id: '1',
      title: 'Tuition Fee',
      amount: 5000,
      paidAmount: 5000,
      dueDate: '2024-01-31',
      status: 'paid' as const,
      academicYear: '2023-2024',
    },
    {
      id: '2',
      title: 'Activity Fee',
      amount: 500,
      paidAmount: 0,
      dueDate: '2024-02-15',
      status: 'pending' as const,
      academicYear: '2023-2024',
    },
  ];

  const mockMessages = [
    {
      id: '1',
      sender: {
        id: '1',
        name: 'Mr. Smith',
        email: 'smith@school.com',
        role: 'teacher' as const,
        status: 'active' as const,
      },
      subject: 'Great work on the project!',
      content: 'Your project submission was excellent...',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
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
            id: 'recent-grades',
            title: 'Recent Grades',
            type: 'card',
            size: 'large',
            content: (
              <div className="space-y-3">
                {mockGrades.slice(0, 2).map((grade) => (
                  <GradeCard key={grade.subject} {...grade} />
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
                    80%
                  </Badge>
                </div>
                <AttendanceCalendar attendanceData={mockAttendance} />
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
                {mockExams.map((exam) => (
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
                        {new Date(exam.date).toLocaleDateString()} at {exam.time}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{exam.hallLocation}</p>
                    </div>
                    <Badge variant="warning">In 3 days</Badge>
                  </div>
                ))}
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
                {mockFees.map((fee) => (
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
                {mockMessages.map((msg) => (
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
    <DashboardLayout title="Dashboard" description="Welcome back! Here's your academic overview.">
      <Dashboard widgets={widgets} loading={loading} error={error || undefined} />
    </DashboardLayout>
  );
};

export default StudentDashboardPage;
