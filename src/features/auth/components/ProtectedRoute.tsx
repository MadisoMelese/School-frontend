import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api.types';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and role-based access
 * Features:
 * - Checks if user is authenticated
 * - Validates user role against allowed roles
 * - Redirects to login if not authenticated
 * - Redirects to 403 if role not authorized
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
