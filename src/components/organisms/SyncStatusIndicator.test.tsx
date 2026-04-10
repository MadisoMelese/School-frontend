import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useOffline } from '@hooks/useOffline';

// Mock hooks
vi.mock('@hooks/useOffline');
vi.mock('@services/offline/syncEngine', () => ({
  getDetailedSyncStatus: vi.fn().mockResolvedValue({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    conflictCount: 0,
  }),
  manualSync: vi.fn().mockResolvedValue(undefined),
}));

describe('SyncStatusIndicator', () => {
  const mockUseOffline = vi.mocked(useOffline);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when online with no pending actions', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    const { container } = render(<SyncStatusIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should render syncing status', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
      getPendingActionCount: () => 3,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('should render error status', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'error',
      getPendingActionCount: () => 2,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: 'Network error',
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    expect(screen.getByText('Sync failed')).toBeInTheDocument();
  });

  it('should render pending count', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      getPendingActionCount: () => 5,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    expect(screen.getByText('5 pending')).toBeInTheDocument();
  });

  it('should have accessible attributes', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
      getPendingActionCount: () => 1,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('should show manual sync button when online with pending actions', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      getPendingActionCount: () => 3,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    const syncButton = screen.getByRole('button', { name: /manually sync pending actions/i });
    expect(syncButton).toBeInTheDocument();
    expect(syncButton).not.toBeDisabled();
  });

  it('should not show manual sync button when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      getPendingActionCount: () => 3,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    const syncButton = screen.queryByRole('button', { name: /manually sync pending actions/i });
    expect(syncButton).not.toBeInTheDocument();
  });

  it('should not show manual sync button when no pending actions', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      getPendingActionCount: () => 0,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    const syncButton = screen.queryByRole('button', { name: /manually sync pending actions/i });
    expect(syncButton).not.toBeInTheDocument();
  });

  it('should not show manual sync button when already syncing', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
      getPendingActionCount: () => 3,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    const syncButton = screen.queryByRole('button', { name: /manually sync pending actions/i });
    expect(syncButton).not.toBeInTheDocument();
  });

  it('should call manualSync when sync button is clicked', async () => {
    const { manualSync } = await import('@services/offline/syncEngine');
    const mockManualSync = vi.mocked(manualSync);

    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      getPendingActionCount: () => 3,
      setOnline: vi.fn(),
      setSyncStatus: vi.fn(),
      syncError: null,
      setSyncError: vi.fn(),
      pendingActions: [],
      addPendingAction: vi.fn(),
      removePendingAction: vi.fn(),
      updatePendingAction: vi.fn(),
      getPendingActions: vi.fn(),
      clearPendingActions: vi.fn(),
    });

    render(<SyncStatusIndicator />);
    const syncButton = screen.getByRole('button', { name: /manually sync pending actions/i });
    
    await syncButton.click();
    
    expect(mockManualSync).toHaveBeenCalledTimes(1);
  });
});
