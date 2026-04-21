import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Dashboard, Widget } from '@components/organisms/Dashboard';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { useAuth } from '@hooks/useAuth';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useOffline } from '@hooks/useOffline';
import { teacherService } from '@services/api/teacherService';

/**
 * Teacher Dashboard Page
 * Displays role-specific widgets for teachers:
 * - Assigned classes
 * - Pending grading tasks
 * - Today's attendance marking
 * - Recent messages
 * Mobile-first responsive design with dark theme support
 */

interface DashboardState {
  scrollPosition: number;
  lastUpdated: number;
}

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    `dashboard-${user?.id}`,
    { scrollPosition: 0, lastUpdated: Date.now() }
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [classStudents, setClassStudents] = useState<any>(null);
  const [classStudentsLoading, setClassStudentsLoading] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await teacherService.getDashboard();

        // Fetch class students if teacher has an ID
        if (user?.id) {
          try {
            setClassStudentsLoading(true);
            // Use "me" to get the current teacher's class students
            const studentsData = await teacherService.getClassStudents('me');
            setClassStudents(studentsData);
          } catch (err) {
            console.error('Failed to fetch class students:', err);
          } finally {
            setClassStudentsLoading(false);
          }
        }

        // Create widgets with real data
        const dashboardWidgets: Widget[] = [
          {
            id: 'assigned-classes',
            title: 'Assigned Classes',
            type: 'list',
            size: 'large',
            content: (
              <div className="space-y-2 sm:space-y-3">
                {Array.isArray(data.classes) && data.classes.length > 0 ? (
                  data.classes.map((cls: any) => (
                    <div
                      key={cls._id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">
                          {cls.name}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {cls.students?.length || 0} students • Grade {cls.grade}
                        </p>
                      </div>
                      <Icon
                        name="ChevronRight"
                        size={16}
                        className="text-neutral-400 dark:text-neutral-500 flex-shrink-0 ml-2"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 p-3">
                    No classes assigned
                  </p>
                )}
              </div>
            ),
          },
          {
            id: 'class-students',
            title: 'Class Students',
            type: 'list',
            size: 'large',
            content: classStudentsLoading ? (
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 p-3">
                Loading students...
              </p>
            ) : classStudents?.class ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="p-3 sm:p-4 bg-primary-50 dark:bg-primary-900 rounded-lg mb-3">
                  <p className="font-semibold text-primary-900 dark:text-primary-100 text-sm sm:text-base">
                    {classStudents.class.name} - {classStudents.class.section}
                  </p>
                  <p className="text-xs sm:text-sm text-primary-700 dark:text-primary-300 mt-1">
                    Grade {classStudents.class.grade} • {classStudents.students?.length || 0} students
                  </p>
                </div>
                {Array.isArray(classStudents.students) && classStudents.students.length > 0 ? (
                  <div className="space-y-2">
                    {classStudents.students.map((student: any) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {student.studentId}
                          </p>
                        </div>
                        <Badge
                          variant={student.status === 'active' ? 'success' : 'warning'}
                          className="text-xs sm:text-sm flex-shrink-0"
                        >
                          {student.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 p-3">
                    No students in this class
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 p-3">
                No class assigned
              </p>
            ),
          },
          {
            id: 'grading-tasks',
            title: 'Pending Grading',
            type: 'stats',
            size: 'medium',
            content: (
              <div className="space-y-2 sm:space-y-3">
                {Array.isArray(data.pendingGrades) && data.pendingGrades.length > 0 ? (
                  data.pendingGrades.map((task: any) => (
                    <div key={task._id} className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base">
                            {task.className}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {task.subject}
                          </p>
                        </div>
                        <Badge variant="warning" className="text-xs sm:text-sm flex-shrink-0">
                          {task.gradedCount}/{task.studentCount}
                        </Badge>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-warning-500 transition-all"
                          style={{
                            width: `${(task.gradedCount / task.studentCount) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 p-3">
                    No pending grading tasks
                  </p>
                )}
              </div>
            ),
          },
          {
            id: 'attendance-marking',
            title: "Today's Attendance",
            type: 'list',
            size: 'medium',
            content: (
              <div className="space-y-2 sm:space-y-3">
                {Array.isArray(data.todayAttendance) && data.todayAttendance.length > 0 ? (
                  data.todayAttendance.map((cls: any) => (
                    <div
                      key={cls._id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base">
                          {cls.className}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {cls.time}
                        </p>
                      </div>
                      <Badge
                        variant={cls.status === 'completed' ? 'success' : 'warning'}
                        className="text-xs sm:text-sm flex-shrink-0"
                      >
                        {cls.status === 'completed' ? 'Done' : 'Pending'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 p-3">
                    No attendance to mark
                  </p>
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
              <div className="space-y-2 sm:space-y-3">
                {Array.isArray(data.messages) && data.messages.length > 0 ? (
                  data.messages.map((msg: any) => {
                    const senderName = msg.senderId
                      ? `${msg.senderId.firstName} ${msg.senderId.lastName}`
                      : 'Unknown Sender';
                    return (
                      <div
                        key={msg._id}
                        className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                          msg.isRead
                            ? 'bg-neutral-50 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600'
                            : 'bg-blue-50 dark:bg-blue-900 border-primary-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base">
                              {senderName}
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 truncate">
                              {msg.subject}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 p-3">
                    No messages
                  </p>
                )}
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
  }, [user?.id]);

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
        !isOnline
          ? 'Offline mode - showing cached data'
          : 'Welcome! Here\'s your teaching overview.'
      }
    >
      {!isOnline && (
        <div className="mb-4 p-3 sm:p-4 bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-800 rounded-lg flex items-center gap-2">
          <Icon name="WifiOff" size={18} className="text-warning-600 dark:text-warning-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-warning-800 dark:text-warning-200">
            You're offline. Showing cached data.
          </span>
        </div>
      )}
      <Dashboard widgets={widgets} loading={loading} error={error || undefined} />
    </DashboardLayout>
  );
};

export default TeacherDashboardPage;
