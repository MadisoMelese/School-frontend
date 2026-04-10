import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManualSyncButton } from './ManualSyncButton';
import { useOffline } from '@hooks/useOffline';
import { manualSync } from '@services/offline/syncEngine';

// Mock hooks and services
vi.mock('@hooks/useOffline');
vi.mock('@services/offline/syncEngine', () => ({
  manualSync: vi.fn(),
}));

describe('ManualSyncButton', () => {
  const mockUseOffline = vi.mocked(useOffline);
  const mockManualSync = vi.mocked(manualSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with pending actions', () => {
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

    render(<ManualSyncButton />);
    expect(screen.getByText('Sync 3 actions')).toBeInTheDocument();
  });

  it('should be disabled when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      getPendingActionCount: () => 2,
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

    render(<ManualSyncButton />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should be disabled when no pending actions', () => {
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

    render(<ManualSyncButton />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('No pending actions')).toBeInTheDocument();
  });

  it('should trigger manual sync on click', async () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      getPendingActionCount: () => 2,
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

    mockManualSync.mockResolvedValue();

    render(<ManualSyncButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockManualSync).toHaveBeenCalled();
    });
  });

  it('should show success message after sync', async () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
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

    mockManualSync.mockResolvedValue();

    render(<ManualSyncButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Synced!')).toBeInTheDocument();
    });
  });

  it('should show error message on sync failure', async () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
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

    mockManualSync.mockRejectedValue(new Error('Network error'));

    render(<ManualSyncButton />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Sync failed')).toBeInTheDocument();
    });
  });

  it('should have accessible attributes', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
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

    render(<ManualSyncButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('should render without label when showLabel is false', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
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

    render(<ManualSyncButton showLabel={false} />);
    expect(screen.queryByText('Sync 1 action')).not.toBeInTheDocument();
  });
});
