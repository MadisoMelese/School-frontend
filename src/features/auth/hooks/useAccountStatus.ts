import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * useAccountStatus Hook
 * Monitors user account status and handles blocking/deactivation
 * Features:
 * - Checks if account is blocked or inactive
 * - Displays appropriate error message
 * - Logs out user if account is blocked
 * - Prevents access to protected routes
 */

export interface AccountStatusError {
  type: 'blocked' | 'inactive' | 'none';
  message: string;
}

export const useAccountStatus = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statusError, setStatusError] = useState<AccountStatusError>({
    type: 'none',
    message: '',
  });

  useEffect(() => {
    if (!user) {
      setStatusError({ type: 'none', message: '' });
      return;
    }

    // Check account status
    if (user.isBlocked) {
      setStatusError({
        type: 'blocked',
        message: 'Your account has been blocked. Please contact the administrator for assistance.',
      });

      // Logout user
      logout();
      navigate('/login', { replace: true });
    } else if (!user.isActive) {
      setStatusError({
        type: 'inactive',
        message: 'Your account is inactive. Please contact the administrator to reactivate it.',
      });

      // Logout user
      logout();
      navigate('/login', { replace: true });
    } else {
      setStatusError({ type: 'none', message: '' });
    }
  }, [user, logout, navigate]);

  return {
    statusError,
    isAccountActive: statusError.type === 'none',
  };
};

export default useAccountStatus;
