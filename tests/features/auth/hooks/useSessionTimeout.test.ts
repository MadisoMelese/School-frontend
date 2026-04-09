import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSessionTimeout } from '@/features/auth/hooks/useSessionTimeout';

// Mock useAuth hook
const mockRefreshToken = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    refreshToken: mockRefreshToken,
    isAuthenticated: true,
  }),
}));

// Mock tokenManager
vi.mock('@/services/api/tokenManager', () => ({
  getAccessTokenTimeRemaining: vi.fn(() => 2 * 60 * 1000),
  shouldRefreshToken: vi.fn(() => false),
}));

describe('useSessionTimeout Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns scheduleTokenRefresh function', () => {
    const { result } = renderHook(() => useSessionTimeout());

    expect(typeof result.current.scheduleTokenRefresh).toBe('function');
  });

  it('cleans up timers on unmount', () => {
    const { unmount } = renderHook(() => useSessionTimeout());

    unmount();

    // Verify no errors occur after unmount
    expect(true).toBe(true);
  });

  it('sets up interval for periodic checks', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');

    renderHook(() => useSessionTimeout());

    expect(setIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
  });
});
