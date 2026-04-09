import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogout } from '@/features/auth/hooks/useLogout';

// Mock useAuth hook
const mockLogout = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useLogout Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls logout action and navigates to login', async () => {
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('navigates to login even if logout action fails', async () => {
    mockLogout.mockImplementation(() => {
      throw new Error('Logout failed');
    });

    const { result } = renderHook(() => useLogout());

    // The logout function should still navigate even if logout action fails
    await result.current.logout();

    // Navigation should happen
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('returns logout function', () => {
    const { result } = renderHook(() => useLogout());

    expect(typeof result.current.logout).toBe('function');
  });
});
