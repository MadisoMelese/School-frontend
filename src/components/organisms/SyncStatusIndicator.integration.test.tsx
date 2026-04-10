import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useOfflineStore } from '@/store/offlineStore';
import * as syncEngine from '@services/offline/syncEngine';

vi.mock('@services/offline/syncEngine', async () => {
  const actual = await vi.importActual('@services/offline/syncEngine');
  return {
    ...actual,
    getDetailedSyncStatus: vi.fn().mockResolvedValue({
      isOnline: true,
      isSyncing: false,
      pendingCount: 0,
      conflictCount: 0,
    }),
    manualSync: vi.fn().mockResolvedValue(undefined),
  };
});

/**
 * Integration tests for SyncStatusIndicator with manual sync trigger
 */
describe('SyncStatusIndicator Manual Sync Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    const store = useOfflineStore.getState();
    store.clearPendingActions();
    store.setOnline(true);
    store.setSyncStatus('idle');
    store.setSyncError(null);
  });

  it('should trigger manual sync when button is clicked', async () => {
    const user = userEvent.setup();
    const mockManualSync = vi.spyOn(syncEngine, 'manualSync');

    // Add pending actions
    const store = useOfflineStore.getState();
    store.addPendingAction({
      type: 'create',
      resource: 'attendance',
      data: { studentId: '1', status: 'present' },
    });

    render(<SyncStatusIndicator />);

    // Should show sync button
    const syncButton = await screen.findByRole('button', { name: /manually sync pending actions/i });
    expect(syncButton).toBeInTheDocument();

    // Click sync button
    await user.click(syncButton);

    // Should call manualSync
    await waitFor(() => {
      expect(mockManualSync).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable sync button while syncing', async () => {
    const user = userEvent.setup();
    
    // Add pending actions
    const store = useOfflineStore.getState();
    store.addPendingAction({
      type: 'create',
      resource: 'attendance',
      data: { studentId: '1', status: 'present' },
    });

    // Mock manualSync to take some time
    vi.spyOn(syncEngine, 'manualSync').mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<SyncStatusIndicator />);

    const syncButton = await screen.findByRole('button', { name: /manually sync pending actions/i });
    
    // Click sync button
    await user.click(syncButton);

    // Button should be disabled while syncing
    expect(syncButton).toBeDisabled();

    // Wait for sync to complete
    await waitFor(() => {
      expect(syncButton).not.toBeDisabled();
    }, { timeout: 200 });
  });

  it('should not show sync button when offline', () => {
    const store = useOfflineStore.getState();
    store.setOnline(false);
    store.addPendingAction({
      type: 'create',
      resource: 'attendance',
      data: { studentId: '1', status: 'present' },
    });

    render(<SyncStatusIndicator />);

    const syncButton = screen.queryByRole('button', { name: /manually sync pending actions/i });
    expect(syncButton).not.toBeInTheDocument();
  });

  it('should not show sync button when no pending actions', () => {
    const store = useOfflineStore.getState();
    store.setOnline(true);
    store.clearPendingActions();

    const { container } = render(<SyncStatusIndicator />);

    // Component should not render at all when no pending actions
    expect(container.firstChild).toBeNull();
  });

  it('should handle sync errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock manualSync to fail
    vi.spyOn(syncEngine, 'manualSync').mockRejectedValue(new Error('Network error'));

    const store = useOfflineStore.getState();
    store.addPendingAction({
      type: 'create',
      resource: 'attendance',
      data: { studentId: '1', status: 'present' },
    });

    render(<SyncStatusIndicator />);

    const syncButton = await screen.findByRole('button', { name: /manually sync pending actions/i });
    
    // Click sync button
    await user.click(syncButton);

    // Should log error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Manual sync failed:', expect.any(Error));
    });

    // Button should be enabled again after error
    await waitFor(() => {
      expect(syncButton).not.toBeDisabled();
    });

    consoleErrorSpy.mockRestore();
  });
});
