import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OfflineIndicator } from './OfflineIndicator';
import { useOffline } from '@hooks/useOffline';

// Mock the useOffline hook
vi.mock('@hooks/useOffline');

describe('OfflineIndicator', () => {
  const mockUseOffline = vi.mocked(useOffline);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should not render when online', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render offline banner when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    render(<OfflineIndicator />);
    expect(screen.getByText("You're offline")).toBeInTheDocument();
  });

  it('should display pending action count when offline with pending actions', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 3,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    render(<OfflineIndicator />);
    expect(screen.getByText(/3 actions pending sync/i)).toBeInTheDocument();
  });

  it('should display singular "action" when only 1 pending action', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 1,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    render(<OfflineIndicator />);
    expect(screen.getByText(/1 action pending sync/i)).toBeInTheDocument();
  });

  it('should show "Back online" message when reconnecting', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    // Start offline
    const { rerender } = render(<OfflineIndicator />);
    
    // Simulate going offline first
    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });
    rerender(<OfflineIndicator />);
    
    // Then go back online
    mockUseOffline.mockReturnValue({
      isOnline: true,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });
    rerender(<OfflineIndicator />);
    
    expect(screen.getByText('Back online')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes for accessibility', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    render(<OfflineIndicator />);
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'assertive');
    expect(banner).toHaveAttribute('aria-atomic', 'true');
  });

  it('should auto-hide after animation when coming back online', async () => {
    vi.useFakeTimers();

    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    const { rerender, container } = render(<OfflineIndicator />);
    expect(screen.getByText("You're offline")).toBeInTheDocument();

    // Go back online
    mockUseOffline.mockReturnValue({
      isOnline: true,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });
    rerender(<OfflineIndicator />);

    // Should show "Back online" initially
    expect(screen.getByText('Back online')).toBeInTheDocument();

    // Fast-forward past animation duration and run all timers
    await vi.runAllTimersAsync();

    // Component should be removed after animation
    expect(container.firstChild).toBeNull();

    vi.useRealTimers();
  });

  it('should display WifiOff icon when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    // Icon component should be rendered (checking for the presence of svg or icon wrapper)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      syncStatus: 'idle',
      setSyncStatus: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
    });

    const { container } = render(<OfflineIndicator />);
    const banner = container.firstChild as HTMLElement;
    
    expect(banner).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
  });
});
