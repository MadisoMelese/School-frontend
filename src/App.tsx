import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@hooks/useAuth'
import { useTheme } from '@hooks/useTheme'

// Layouts
import { AuthLayout } from '@components/templates/AuthLayout'

// Auth Pages
import { LoginPage } from '@features/auth/pages/LoginPage'
import { PasswordResetPage } from '@features/auth/pages/PasswordResetPage'
import { ChangePasswordPage } from '@features/auth/pages/ChangePasswordPage'

// Student Portal Pages
import StudentDashboard from '@features/student/pages/DashboardPage'
import { GradesPage } from '@features/student/pages/GradesPage'
import { AttendancePage } from '@features/student/pages/AttendancePage'
import { ExamsPage } from '@features/student/pages/ExamsPage'
import { FeesPage } from '@features/student/pages/FeesPage'
import { MessagesPage as StudentMessagesPage } from '@features/student/pages/MessagesPage'
import { TimetablePage } from '@features/student/pages/TimetablePage'

// Teacher Portal Pages
import TeacherDashboard from '@features/teacher/pages/DashboardPage'
import { ClassesPage } from '@features/teacher/pages/ClassesPage'
import { ClassDetailsPage } from '@features/teacher/pages/ClassDetailsPage'
import { AttendanceMarkingPage } from '@features/teacher/pages/AttendanceMarkingPage'
import { GradeManagementPage } from '@features/teacher/pages/GradeManagementPage'
import TeacherMessagesPage from '@features/teacher/pages/MessagesPage'

// Parent Portal Pages
import ParentDashboard from '@features/parent/pages/DashboardPage'
import { ChildProgressPage } from '@features/parent/pages/ChildProgressPage'
import { ChildAttendancePage } from '@features/parent/pages/ChildAttendancePage'
import { ChildExamsPage } from '@features/parent/pages/ChildExamsPage'
import { ChildFeesPage } from '@features/parent/pages/ChildFeesPage'
import ParentMessagesPage from '@features/parent/pages/MessagesPage'

// Admin Portal Pages
import AdminDashboard from '@features/admin/pages/DashboardPage'
import { UserManagementPage } from '@features/admin/pages/UserManagementPage'
import { SettingsPage } from '@features/admin/pages/SettingsPage'
import { SystemLogsPage } from '@features/admin/pages/SystemLogsPage'

// Auth Layout Wrapper
const AuthLayoutWrapper = () => (
  <AuthLayout>
    <Outlet />
  </AuthLayout>
)

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Error Pages
const UnauthorizedPage = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">403</h1>
      <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">Unauthorized Access</p>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
        You don't have permission to access this resource.
      </p>
    </div>
  </div>
)

const NotFoundPage = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">404</h1>
      <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">Page Not Found</p>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
        The page you're looking for doesn't exist.
      </p>
    </div>
  </div>
)

function App() {
  const { user, isAuthenticated, initializeAuth } = useAuth()
  const { theme } = useTheme()

  // Initialize auth from stored tokens on app load
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayoutWrapper />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

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
              <AttendanceMarkingPage />
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
              <ChildAttendancePage />
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

        {/* Root redirect based on authentication */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate to={`/${user.role}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
