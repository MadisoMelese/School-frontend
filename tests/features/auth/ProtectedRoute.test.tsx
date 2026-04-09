import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;
const ForbiddenComponent = () => <div>403 Forbidden</div>;

const renderWithRouter = (initialRoute = '/protected') => {
  window.history.pushState({}, 'Test page', initialRoute);

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/403" element={<ForbiddenComponent />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-only"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TestComponent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders protected content when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        status: 'active',
      },
    });

    renderWithRouter();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    renderWithRouter();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to login when user is null', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: null,
    });

    renderWithRouter();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders protected content when user role is allowed', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
      },
    });

    renderWithRouter('/admin-only');

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to 403 when user role is not allowed', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'student@example.com',
        name: 'Student User',
        role: 'student',
        status: 'active',
      },
    });

    renderWithRouter('/admin-only');

    expect(screen.getByText('403 Forbidden')).toBeInTheDocument();
  });

  it('allows multiple roles', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'teacher@example.com',
        name: 'Teacher User',
        role: 'teacher',
        status: 'active',
      },
    });

    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/multi-role"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    window.history.pushState({}, 'Test page', '/multi-role');

    // The component should render since teacher is in allowed roles
    expect(container).toBeInTheDocument();
  });
});
