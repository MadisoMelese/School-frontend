/**
 * usePWA Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePWA } from './usePWA';

// Mock the service worker registration module
vi.mock('@services/pwa/serviceWorkerRegistration', () => ({
  registerServiceWorker: vi.fn((config) => {
    // Simulate service worker registration
    if (config?.onOfflineReady) {
      setTimeout(() => config.onOfflineReady(), 100);
    }
  }),
  updateServiceWorker: vi.fn(),
}));

describe('usePWA', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    // Mock window event listeners
    global.addEventListener = vi.fn();
    global.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isOffline).toBe(false);
    expect(result.current.needRefresh).toBe(false);
    expect(result.current.offlineReady).toBe(false);
    expect(result.current.canInstall).toBe(false);
  });

  it('should detect offline status', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => usePWA());

    expect(result.current.isOffline).toBe(true);
  });

  it('should update offline status when going offline', async () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isOffline).toBe(false);

    // Simulate going offline
    act(() => {
      Object.defineProperty(global.navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true);
    });
  });

  it('should update offline status when going online', async () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => usePWA());

    expect(result.current.isOffline).toBe(true);

    // Simulate going online
    act(() => {
      Object.defineProperty(global.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOffline).toBe(false);
    });
  });

  it('should set offlineReady when service worker is ready', async () => {
    const { result } = renderHook(() => usePWA());

    await waitFor(
      () => {
        expect(result.current.offlineReady).toBe(true);
      },
      { timeout: 200 }
    );
  });

  it('should handle install prompt', async () => {
    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    const { result } = renderHook(() => usePWA());

    // Simulate beforeinstallprompt event
    act(() => {
      window.dispatchEvent(
        Object.assign(new Event('beforeinstallprompt'), mockEvent)
      );
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });

    // Trigger install
    await act(async () => {
      await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
  });

  it('should handle app installed event', async () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    const { result } = renderHook(() => usePWA());

    // Simulate beforeinstallprompt event
    act(() => {
      window.dispatchEvent(
        Object.assign(new Event('beforeinstallprompt'), mockEvent)
      );
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true);
    });

    // Simulate app installed
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(false);
    });
  });

  it('should not prompt install when not available', async () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.canInstall).toBe(false);

    // Should not throw when calling promptInstall
    await expect(result.current.promptInstall()).resolves.not.toThrow();
  });
});
