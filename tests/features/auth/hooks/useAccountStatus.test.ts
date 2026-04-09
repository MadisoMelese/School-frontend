import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAccountStatus } from '@/features/auth/hooks/useAccountStatus';

// Mock useAuth hook
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useAccountStatus Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns no error for active account', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        status: 'active',
      },
      logout: mockLogout,
    });

    const { result } = renderHook(() => useAccountStatus());

    expect(result.current.statusError.type).toBe('none');
    expect(result.current.isAccountActive).toBe(true);
  });

  it('returns error for blocked account and logs out', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        status: 'blocked',
      },
      logout: mockLogout,
    });

    const { result } = renderHook(() => useAccountStatus());

    expect(result.current.statusError.type).toBe('blocked');
    expect(result.current.statusError.message).toContain('blocked');
    expect(result.current.isAccountActive).toBe(false);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('returns error for inactive account and logs out', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        status: 'inactive',
      },
      logout: mockLogout,
    });

    const { result } = renderHook(() => useAccountStatus());

    expect(result.current.statusError.type).toBe('inactive');
    expect(result.current.statusError.message).toContain('inactive');
    expect(result.current.isAccountActive).toBe(false);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('clears error when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    const { result } = renderHook(() => useAccountStatus());

    expect(result.current.statusError.type).toBe('none');
    expect(result.current.isAccountActive).toBe(true);
  });

  it('updates error when user status changes', () => {
    const { rerender } = renderHook(() => useAccountStatus(), {
      initialProps: undefined,
    });

    // Start with active user
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        status: 'active',
      },
      logout: mockLogout,
    });

    rerender();

    // Change to blocked user
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        status: 'blocked',
      },
      logout: mockLogout,
    });

    rerender();

    expect(mockLogout).toHaveBeenCalled();
  });
});
