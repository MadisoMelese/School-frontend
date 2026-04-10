/**
 * PWA Install Prompt Component
 * 
 * Displays a prompt to install the app as a PWA
 */

import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '@hooks/usePWA';

export function PWAInstallPrompt() {
  const { canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    await promptInstall();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-slide-up">
      <div className="rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Download className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Install SchoolOS
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Install SchoolOS on your device for quick access and offline use.
              </p>
              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={handleInstall}
                  className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-400"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:bg-neutral-700 dark:text-neutral-100 dark:ring-neutral-600 dark:hover:bg-neutral-600"
                >
                  Not now
                </button>
              </div>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:text-neutral-500 dark:hover:text-neutral-400"
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
