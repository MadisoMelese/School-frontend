import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import { initializeSyncEngine, cleanupSyncEngine } from '@/services/offline/syncEngine';
import { initializeDB } from '@/services/offline/indexedDB';

// PWA Components
import { PWAUpdatePrompt } from '@components/organisms/PWAUpdatePrompt';
import { PWAInstallPrompt } from '@components/organisms/PWAInstallPrompt';
import { OfflineIndicator } from '@components/organisms/OfflineIndicator';
import { ErrorBoundary } from '@components/organisms/ErrorBoundary';
import { RealtimeProvider } from '@components/organisms/RealtimeProvider';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
    </div>
  </div>
);

// Auth Pages - Lazy loaded
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const PasswordResetPage = lazy(() => import('@features/auth/pages/PasswordResetPage').then(m => ({ default: m.PasswordResetPage })));
const ChangePasswordPage = lazy(() => import('@features/auth/pages/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));
const LandingPage = lazy(() => import('@features/common/pages/LandingPage'));
const SchoolInfoPage = lazy(() => import('@features/common/pages/SchoolInfoPage'));
const SchoolSiteManagementPage = lazy(() => import('@features/admin/pages/SchoolSiteManagementPage'));

// Common Pages (shared across roles) - Lazy loaded
const AttendancePage = lazy(() => import('@features/common/pages/AttendancePage').then(m => ({ default: m.AttendancePage })));

// Student Portal Pages - Lazy loaded
const StudentDashboard = lazy(() => import('@features/student/pages/DashboardPage'));
const GradesPage = lazy(() => import('@features/student/pages/GradesPage').then(m => ({ default: m.GradesPage })));
const ExamsPage = lazy(() => import('@features/student/pages/ExamsPage').then(m => ({ default: m.ExamsPage })));
const FeesPage = lazy(() => import('@features/student/pages/FeesPage').then(m => ({ default: m.FeesPage })));
const StudentMessagesPage = lazy(() => import('@features/student/pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const TimetablePage = lazy(() => import('@features/student/pages/TimetablePage').then(m => ({ default: m.TimetablePage })));

// Teacher Portal Pages - Lazy loaded
const TeacherDashboard = lazy(() => import('@features/teacher/pages/DashboardPage'));
const ClassesPage = lazy(() => import('@features/teacher/pages/ClassesPage').then(m => ({ default: m.ClassesPage })));
const ClassDetailsPage = lazy(() => import('@features/teacher/pages/ClassDetailsPage').then(m => ({ default: m.ClassDetailsPage })));
const GradeManagementPage = lazy(() => import('@features/teacher/pages/GradeManagementPage').then(m => ({ default: m.GradeManagementPage })));
const TeacherMessagesPage = lazy(() => import('@features/teacher/pages/MessagesPage'));

// Parent Portal Pages - Lazy loaded
const ParentDashboard = lazy(() => import('@features/parent/pages/DashboardPage'));
const ChildProgressPage = lazy(() => import('@features/parent/pages/ChildProgressPage').then(m => ({ default: m.ChildProgressPage })));
const ChildExamsPage = lazy(() => import('@features/parent/pages/ChildExamsPage').then(m => ({ default: m.ChildExamsPage })));
const ChildFeesPage = lazy(() => import('@features/parent/pages/ChildFeesPage').then(m => ({ default: m.ChildFeesPage })));
const ParentMessagesPage = lazy(() => import('@features/parent/pages/MessagesPage'));

// Admin Portal Pages - Lazy loaded
const AdminDashboard = lazy(() => import('@features/admin/pages/DashboardPage'));
const UserManagementPage = lazy(() => import('@features/admin/pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const SettingsPage = lazy(() => import('@features/admin/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SystemLogsPage = lazy(() => import('@features/admin/pages/SystemLogsPage').then(m => ({ default: m.SystemLogsPage })));
const StudentsManagementPage = lazy(() => import('@features/admin/pages/StudentsManagementPage').then(m => ({ default: m.StudentsManagementPage })));
const TeachersManagementPage = lazy(() => import('@features/admin/pages/TeachersManagementPage').then(m => ({ default: m.TeachersManagementPage })));
const ClassesManagementPage = lazy(() => import('@features/admin/pages/ClassesManagementPage').then(m => ({ default: m.ClassesManagementPage })));
const ExamsManagementPage = lazy(() => import('@features/admin/pages/ExamsManagementPage').then(m => ({ default: m.ExamsManagementPage })));
const GradesManagementPage = lazy(() => import('@features/admin/pages/GradesManagementPage').then(m => ({ default: m.GradesManagementPage })));
const FeesManagementPage = lazy(() => import('@features/admin/pages/FeesManagementPage').then(m => ({ default: m.FeesManagementPage })));
const AnnouncementsManagementPage = lazy(() => import('@features/admin/pages/AnnouncementsManagementPage').then(m => ({ default: m.AnnouncementsManagementPage })));
const MessagesManagementPage = lazy(() => import('@features/admin/pages/MessagesManagementPage').then(m => ({ default: m.MessagesManagementPage })));
const LibraryManagementPage = lazy(() => import('@features/admin/pages/LibraryManagementPage').then(m => ({ default: m.LibraryManagementPage })));
const TimetablesManagementPage = lazy(() => import('@features/admin/pages/TimetablesManagementPage').then(m => ({ default: m.TimetablesManagementPage })));
const StaffManagementPage = lazy(() => import('@features/admin/pages/StaffManagementPage').then(m => ({ default: m.StaffManagementPage })));

// Protected Route Component
const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Error Pages
const UnauthorizedPage = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">403</h1>
      <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">Unauthorized Access</p>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
        You don&apos;t have permission to access this resource.
      </p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">404</h1>
      <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">Page Not Found</p>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
    </div>
  </div>
);

function App() {
  const { user, isAuthenticated, initializeAuth } = useAuth();
  const { theme } = useTheme();

  // Initialize auth from stored tokens on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize offline sync engine and IndexedDB
  useEffect(() => {
    const initOffline = async () => {
      try {
        await initializeDB();
        initializeSyncEngine();
      } catch (error) {
        console.error('Failed to initialize offline features:', error);
      }
    };

    initOffline();

    // Cleanup on unmount
    return () => {
      cleanupSyncEngine();
    };
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <RealtimeProvider>
          <OfflineIndicator />
          <PWAUpdatePrompt />
          <PWAInstallPrompt />
          <Suspense fallback={<PageLoader />}>
            <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/latest/:section" element={<SchoolInfoPage />} />
          <Route path="/about/:section" element={<SchoolInfoPage />} />
          <Route path="/contact" element={<SchoolInfoPage />} />

          {/* Student Portal Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/grades"
            element={
              <ProtectedRoute requiredRole="student">
                <GradesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute requiredRole="student">
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute requiredRole="student">
                <ExamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/fees"
            element={
              <ProtectedRoute requiredRole="student">
                <FeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/messages"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute requiredRole="student">
                <TimetablePage />
              </ProtectedRoute>
            }
          />

          {/* Teacher Portal Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute requiredRole="teacher">
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes/:classId"
            element={
              <ProtectedRoute requiredRole="teacher">
                <ClassDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute requiredRole="teacher">
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/grades"
            element={
              <ProtectedRoute requiredRole="teacher">
                <GradeManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/messages"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherMessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Parent Portal Routes */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/child-progress"
            element={
              <ProtectedRoute requiredRole="parent">
                <ChildProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/child-attendance"
            element={
              <ProtectedRoute requiredRole="parent">
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/child-exams"
            element={
              <ProtectedRoute requiredRole="parent">
                <ChildExamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/child-fees"
            element={
              <ProtectedRoute requiredRole="parent">
                <ChildFeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/messages"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentMessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute requiredRole="admin">
                <StudentsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute requiredRole="admin">
                <TeachersManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute requiredRole="admin">
                <ClassesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute requiredRole="admin">
                <ExamsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/grades"
            element={
              <ProtectedRoute requiredRole="admin">
                <GradesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute requiredRole="admin">
                <FeesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requiredRole="admin">
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute requiredRole="admin">
                <AnnouncementsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/school-site"
            element={
              <ProtectedRoute requiredRole="admin">
                <SchoolSiteManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute requiredRole="admin">
                <MessagesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/library"
            element={
              <ProtectedRoute requiredRole="admin">
                <LibraryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/timetables"
            element={
              <ProtectedRoute requiredRole="admin">
                <TimetablesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute requiredRole="admin">
                <StaffManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute requiredRole="admin">
                <SystemLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Public school landing page; authenticated users go to their portal. */}
          <Route
            path="/"
            element={
              isAuthenticated && user ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </RealtimeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
