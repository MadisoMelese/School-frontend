/**
 * usePWA Hook
 * 
 * Manages PWA functionality including:
 * - Service worker registration
 * - Update notifications
 * - Offline status
 * - Install prompt
 * 
 * Integrates with UI store (Zustand) for state management
 */

import { useEffect, useState } from 'react';
import { registerServiceWorker, updateServiceWorker } from '@services/pwa/serviceWorkerRegistration';
import { useUIStore } from '@store/uiStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  isOffline: boolean;
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => void;
  canInstall: boolean;
  promptInstall: () => Promise<void>;
}

export function usePWA(): UsePWAReturn {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Get service worker state from UI store
  const needRefresh = useUIStore((state) => state.serviceWorkerUpdateAvailable);
  const offlineReady = useUIStore((state) => state.serviceWorkerOfflineReady);
  const setNeedRefresh = useUIStore((state) => state.setServiceWorkerUpdateAvailable);
  const setOfflineReady = useUIStore((state) => state.setServiceWorkerOfflineReady);

  useEffect(() => {
    // Register service worker
    registerServiceWorker({
      onNeedRefresh: () => {
        setNeedRefresh(true);
      },
      onOfflineReady: () => {
        setOfflineReady(true);
      },
    });

    // Handle online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setNeedRefresh, setOfflineReady]);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    setDeferredPrompt(null);
  };

  return {
    isOffline,
    needRefresh,
    offlineReady,
    updateServiceWorker,
    canInstall: !!deferredPrompt,
    promptInstall,
  };
}
