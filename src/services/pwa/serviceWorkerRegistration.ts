/**
 * Service Worker Registration
 * 
 * Handles registration, updates, and lifecycle of the service worker
 * using Workbox for PWA functionality.
 */

import { Workbox } from 'workbox-window';

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onNeedRefresh?: () => void;
}

let wb: Workbox | undefined;

/**
 * Register the service worker
 */
export function registerServiceWorker(config?: ServiceWorkerConfig) {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return;
  }

  // Only register in production
  if (import.meta.env.DEV) {
    console.log('Service worker registration skipped in development mode');
    return;
  }

  wb = new Workbox('/sw.js');

  // Handle service worker updates
  wb.addEventListener('installed', (event) => {
    if (event.isUpdate) {
      console.log('New service worker installed, update available');
      config?.onUpdate?.(event.sw as unknown as ServiceWorkerRegistration);
      config?.onNeedRefresh?.();
    } else {
      console.log('Service worker installed for the first time');
      config?.onSuccess?.(event.sw as unknown as ServiceWorkerRegistration);
      config?.onOfflineReady?.();
    }
  });

  // Handle service worker activation
  wb.addEventListener('activated', (event) => {
    if (!event.isUpdate) {
      console.log('Service worker activated');
    }
  });

  // Handle service worker waiting
  wb.addEventListener('waiting', () => {
    console.log('Service worker is waiting to activate');
    config?.onNeedRefresh?.();
  });

  // Handle service worker controlling
  wb.addEventListener('controlling', () => {
    console.log('Service worker is now controlling the page');
    // Reload the page to ensure all assets are from the new service worker
    window.location.reload();
  });

  // Register the service worker
  wb.register()
    .then((registration) => {
      console.log('Service worker registered successfully', registration);
    })
    .catch((error) => {
      console.error('Service worker registration failed:', error);
    });
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('Service worker unregistered');
  }
}

/**
 * Update the service worker
 */
export function updateServiceWorker() {
  if (wb) {
    wb.messageSkipWaiting();
  }
}

/**
 * Check if there's a service worker update available
 */
export async function checkForUpdates() {
  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Checked for service worker updates');
  }
}

/**
 * Get the current service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    return await navigator.serviceWorker.ready;
  }
  return undefined;
}
