import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { OfflineIndicator } from './OfflineIndicator';
import { useOfflineStore } from '@/store/offlineStore';

/**
 * Integration tests for OfflineIndicator with real offline store
 */
describe('OfflineIndicator Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useOfflineStore.getState();
    store.clearPendingActions();
    store.setOnline(true);
    store.setSyncStatus('idle');
    store.setSyncError(null);
  });

  it('should integrate with offline store and show banner when offline', () => {
    const { container } = render(<OfflineIndicator />);
    
    // Initially online, should not show
    expect(container.firstChild).toBeNull();

    // Simulate going offline
    act(() => {
      useOfflineStore.getState().setOnline(false);
    });

    // Should show offline banner
    expect(screen.getByText("You're offline")).toBeInTheDocument();
  });

  it('should display pending action count from store', () => {
    render(<OfflineIndicator />);

    // Go offline and add pending actions
    act(() => {
      useOfflineStore.getState().setOnline(false);
      useOfflineStore.getState().addPendingAction({
        type: 'create',
        resource: 'attendance',
        data: { status: 'present' },
      });
      useOfflineStore.getState().addPendingAction({
        type: 'update',
        resource: 'grade',
        data: { marks: 85 },
      });
    });

    // Should show 2 pending actions
    expect(screen.getByText(/2 actions pending sync/i)).toBeInTheDocument();
  });

  it('should hide when coming back online', async () => {
    vi.useFakeTimers();
    const { container } = render(<OfflineIndicator />);

    // Go offline
    act(() => {
      useOfflineStore.getState().setOnline(false);
    });

    expect(screen.getByText("You're offline")).toBeInTheDocument();

    // Go back online
    act(() => {
      useOfflineStore.getState().setOnline(true);
    });

    expect(screen.getByText('Back online')).toBeInTheDocument();

    // Fast-forward timers to complete animation
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should be hidden
    expect(container.firstChild).toBeNull();

    vi.useRealTimers();
  });

  it('should respond to browser online/offline events', () => {
    render(<OfflineIndicator />);

    // Simulate browser offline event
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText("You're offline")).toBeInTheDocument();

    // Simulate browser online event
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByText('Back online')).toBeInTheDocument();
  });

  it('should update when pending actions change', () => {
    render(<OfflineIndicator />);

    // Go offline
    act(() => {
      useOfflineStore.getState().setOnline(false);
    });

    // Initially no pending actions
    expect(screen.queryByText(/pending sync/i)).not.toBeInTheDocument();

    // Add a pending action
    act(() => {
      useOfflineStore.getState().addPendingAction({
        type: 'create',
        resource: 'message',
        data: { content: 'test' },
      });
    });

    // Should show 1 pending action
    expect(screen.getByText(/1 action pending sync/i)).toBeInTheDocument();

    // Add another pending action
    act(() => {
      useOfflineStore.getState().addPendingAction({
        type: 'update',
        resource: 'profile',
        data: { name: 'John' },
      });
    });

    // Should show 2 pending actions
    expect(screen.getByText(/2 actions pending sync/i)).toBeInTheDocument();
  });
});
