/**
 * PWA Update Prompt Component
 * 
 * Displays a notification when a new version of the app is available
 * and allows the user to update.
 * 
 * Integrates with UI store (Zustand) for state management
 */

import { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { usePWA } from '@hooks/usePWA';
import { useUIStore } from '@store/uiStore';

export function PWAUpdatePrompt() {
  const { needRefresh, offlineReady, updateServiceWorker: update } = usePWA();
  const [show, setShow] = useState(false);
  const setNeedRefresh = useUIStore((state) => state.setServiceWorkerUpdateAvailable);
  const setOfflineReady = useUIStore((state) => state.setServiceWorkerOfflineReady);

  useEffect(() => {
    if (needRefresh || offlineReady) {
      setShow(true);
    }
  }, [needRefresh, offlineReady]);

  if (!show) {
    return null;
  }

  const handleUpdate = () => {
    setShow(false);
    setNeedRefresh(false);
    update();
  };

  const handleDismiss = () => {
    setShow(false);
    // Reset the state in UI store
    if (needRefresh) {
      setNeedRefresh(false);
    }
    if (offlineReady) {
      setOfflineReady(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <RefreshCw className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {needRefresh ? 'Update Available' : 'App Ready for Offline Use'}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {needRefresh
                  ? 'A new version of SchoolOS is available. Update now to get the latest features and improvements.'
                  : 'SchoolOS is now ready to work offline. You can use the app even without an internet connection.'}
              </p>
              <div className="mt-4 flex space-x-3">
                {needRefresh && (
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-400"
                    aria-label="Update to new version"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:bg-neutral-700 dark:text-neutral-100 dark:ring-neutral-600 dark:hover:bg-neutral-600"
                  aria-label={needRefresh ? 'Update later' : 'Dismiss notification'}
                >
                  {needRefresh ? 'Later' : 'Got it'}
                </button>
              </div>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                aria-label="Close notification"
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
