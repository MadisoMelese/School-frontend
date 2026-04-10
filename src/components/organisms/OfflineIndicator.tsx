import React, { useEffect, useState } from 'react';
import { Icon } from '../atoms/Icon';
import { useOffline } from '@hooks/useOffline';

/**
 * OfflineIndicator Component
 * 
 * Displays a banner notification when the user loses network connectivity.
 * Auto-hides when connection is restored.
 * 
 * Features:
 * - Monitors online/offline status
 * - Displays banner at top of screen when offline
 * - Shows pending sync count if actions are queued
 * - Auto-hides with animation when back online
 * - Mobile-first responsive design
 * - Accessible with ARIA labels
 */
export const OfflineIndicator: React.FC = () => {
  const { isOnline, getPendingActionCount } = useOffline();
  const [show, setShow] = useState(!isOnline);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const pendingCount = getPendingActionCount();

  useEffect(() => {
    if (!isOnline) {
      // Show immediately when going offline
      setShow(true);
      setIsAnimatingOut(false);
    } else if (show) {
      // Animate out when coming back online
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShow(false);
        setIsAnimatingOut(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOnline, show]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isAnimatingOut ? 'animate-slide-out-top' : 'animate-slide-in-top'
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="bg-yellow-500 dark:bg-yellow-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3 text-sm md:text-base">
            {/* Offline Icon */}
            <Icon
              name="WifiOff"
              size="md"
              className="flex-shrink-0"
              aria-hidden={true}
            />

            {/* Message */}
            <div className="flex-1 text-center md:text-left">
              <span className="font-medium">
                {isOnline ? 'Back online' : "You're offline"}
              </span>
              {!isOnline && pendingCount > 0 && (
                <span className="ml-2 text-xs md:text-sm opacity-90">
                  ({pendingCount} {pendingCount === 1 ? 'action' : 'actions'} pending sync)
                </span>
              )}
            </div>

            {/* Online Icon (when reconnecting) */}
            {isOnline && (
              <Icon
                name="CheckCircle"
                size="md"
                className="flex-shrink-0"
                aria-hidden={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
