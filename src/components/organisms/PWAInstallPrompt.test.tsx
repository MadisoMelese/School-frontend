/**
 * PWAInstallPrompt Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import * as usePWAModule from '@hooks/usePWA';

// Mock the usePWA hook
vi.mock('@hooks/usePWA');

describe('PWAInstallPrompt', () => {
  const mockPromptInstall = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when canInstall is false', () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      canInstall: false,
      promptInstall: mockPromptInstall,
    });

    const { container } = render(<PWAInstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when canInstall is true', () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      canInstall: true,
      promptInstall: mockPromptInstall,
    });

    render(<PWAInstallPrompt />);
    
    expect(screen.getByText('Install SchoolOS')).toBeInTheDocument();
    expect(screen.getByText(/Install SchoolOS on your device/i)).toBeInTheDocument();
  });

  it('should call promptInstall when Install button is clicked', async () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      canInstall: true,
      promptInstall: mockPromptInstall,
    });

    render(<PWAInstallPrompt />);
    
    const installButton = screen.getByRole('button', { name: /Install/i });
    fireEvent.click(installButton);

    expect(mockPromptInstall).toHaveBeenCalledTimes(1);
  });

  it('should hide prompt when dismissed via "Not now" button', () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      canInstall: true,
      promptInstall: mockPromptInstall,
    });

    const { container } = render(<PWAInstallPrompt />);
    
    const notNowButton = screen.getByRole('button', { name: /Not now/i });
    fireEvent.click(notNowButton);

    expect(container.firstChild).toBeNull();
  });

  it('should hide prompt when dismissed via close button', () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      canInstall: true,
      promptInstall: mockPromptInstall,
    });

    const { container } = render(<PWAInstallPrompt />);
    
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    expect(container.firstChild).toBeNull();
  });

  it('should have proper accessibility attributes', () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      canInstall: true,
      promptInstall: mockPromptInstall,
    });

    render(<PWAInstallPrompt />);
    
    // Check for screen reader text
    expect(screen.getByText('Close')).toHaveClass('sr-only');
    
    // Check buttons are accessible
    expect(screen.getByRole('button', { name: /Install/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Not now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  it('should display download icon', () => {
    vi.mocked(usePWAModule.usePWA).mockReturnValue({
      isOffline: false,
      needRefresh: false,
      offlineReady: false,
      updateServiceWorker: vi.fn(),
      canInstall: true,
      promptInstall: mockPromptInstall,
    });

    render(<PWAInstallPrompt />);
    
    // Check for Download icon (Lucide icons render as SVG)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
