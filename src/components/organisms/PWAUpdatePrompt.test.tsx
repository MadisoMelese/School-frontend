/**
 * PWAUpdatePrompt Component Tests
 * 
 * Tests for the service worker update notification component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';
import * as usePWAModule from '@hooks/usePWA';
import * as uiStoreModule from '@store/uiStore';

// Mock the usePWA hook
vi.mock('@hooks/usePWA', () => ({
  usePWA: vi.fn(),
}));

// Mock the UI store
vi.mock('@store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('PWAUpdatePrompt', () => {
  const mockUpdateServiceWorker = vi.fn();
  const mockSetNeedRefresh = vi.fn();
  const mockSetOfflineReady = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    // Mock UI store selector
    vi.mocked(uiStoreModule.useUIStore).mockImplementation((selector: any) => {
      const state = {
        serviceWorkerUpdateAvailable: false,
        serviceWorkerOfflineReady: false,
        setServiceWorkerUpdateAvailable: mockSetNeedRefresh,
        setServiceWorkerOfflineReady: mockSetOfflineReady,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should not render when no update is available', () => {
    const { container } = render(<PWAUpdatePrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('should render update notification when update is available', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: true,
      offlineReady: false,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByText('Update Available')).toBeInTheDocument();
      expect(
        screen.getByText(/A new version of SchoolOS is available/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Update Now')).toBeInTheDocument();
      expect(screen.getByText('Later')).toBeInTheDocument();
    });
  });

  it('should render offline ready notification', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: true,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByText('App Ready for Offline Use')).toBeInTheDocument();
      expect(
        screen.getByText(/SchoolOS is now ready to work offline/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Dismiss notification/i })).toBeInTheDocument();
    });
  });

  it('should call updateServiceWorker when Update Now is clicked', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: true,
      offlineReady: false,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update to new version/i })).toBeInTheDocument();
    });

    const updateButton = screen.getByRole('button', { name: /Update to new version/i });
    fireEvent.click(updateButton);

    expect(mockUpdateServiceWorker).toHaveBeenCalledTimes(1);
    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
  });

  it('should dismiss notification when Later is clicked', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: true,
      offlineReady: false,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Later/i })).toBeInTheDocument();
    });

    const laterButton = screen.getByRole('button', { name: /Later/i });
    fireEvent.click(laterButton);

    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
  });

  it('should dismiss notification when close button is clicked', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: true,
      offlineReady: false,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Close notification/i })).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /Close notification/i });
    fireEvent.click(closeButton);

    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
  });

  it('should reset offline ready state when dismissed', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: true,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Dismiss notification/i })).toBeInTheDocument();
    });

    const gotItButton = screen.getByRole('button', { name: /Dismiss notification/i });
    fireEvent.click(gotItButton);

    expect(mockSetOfflineReady).toHaveBeenCalledWith(false);
  });

  it('should have accessible labels for all interactive elements', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: true,
      offlineReady: false,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update to new version/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update later/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Close notification/i })).toBeInTheDocument();
    });
  });

  it('should not show Update Now button for offline ready notification', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: true,
      updateServiceWorker: mockUpdateServiceWorker,
      canInstall: false,
      promptInstall: vi.fn(),
    });

    render(<PWAUpdatePrompt />);

    await waitFor(() => {
      expect(screen.getByText('App Ready for Offline Use')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Update to new version/i })).not.toBeInTheDocument();
  });
});
