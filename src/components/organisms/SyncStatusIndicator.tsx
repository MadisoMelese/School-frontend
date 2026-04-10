import React, { useEffect, useState } from 'react';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';
import { useOffline } from '@hooks/useOffline';
import { getDetailedSyncStatus, manualSync } from '@services/offline/syncEngine';

/**
 * SyncStatusIndicator Component
 * 
 * Displays sync status with pending actions and conflicts count.
 * Shows different states: idle, syncing, error
 * 
 * Features:
 * - Real-time sync status monitoring
 * - Pending actions count
 * - Conflict detection indicator
 * - Animated sync icon
 * - Manual sync trigger button
 * - Mobile-first responsive design
 * - Accessible with ARIA labels
 */
export const SyncStatusIndicator: React.FC = () => {
  const { isOnline, syncStatus, getPendingActionCount } = useOffline();
  const status = syncStatus as 'idle' | 'syncing' | 'error';
  const [conflictCount, setConflictCount] = useState(0);
  const [isSyncingManually, setIsSyncingManually] = useState(false);
  const pendingCount = getPendingActionCount();

  useEffect(() => {
    // Update conflict count periodically
    const updateConflicts = async () => {
      try {
        const status = await getDetailedSyncStatus();
        setConflictCount(status.conflictCount);
      } catch (error) {
        console.error('Failed to get conflict count:', error);
      }
    };

    updateConflicts();
    const interval = setInterval(updateConflicts, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [syncStatus]);

  // Don't show if online with no pending actions and no conflicts
  if (isOnline && pendingCount === 0 && conflictCount === 0 && status === 'idle') {
    return null;
  }

  const getStatusColor = () => {
    if (status === 'error') return 'text-danger-600 dark:text-danger-400';
    if ((status as any) === 'syncing') return 'text-primary-600 dark:text-primary-400';
    if (conflictCount > 0) return 'text-warning-600 dark:text-warning-400';
    return 'text-neutral-600 dark:text-neutral-400';
  };

  const getStatusIcon = () => {
    if (status === 'error') return 'AlertCircle';
    if ((status as any) === 'syncing') return 'RefreshCw';
    if (conflictCount > 0) return 'AlertTriangle';
    return 'Cloud';
  };

  const getStatusText = () => {
    if (status === 'error') return 'Sync failed';
    if ((status as any) === 'syncing') return 'Syncing...';
    if (conflictCount > 0) return `${conflictCount} conflict${conflictCount > 1 ? 's' : ''}`;
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Synced';
  };

  const handleManualSync = async () => {
    if (!isOnline || pendingCount === 0 || (status as any) === 'syncing') {
      return;
    }

    setIsSyncingManually(true);
    try {
      await manualSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncingManually(false);
    }
  };

  const shouldShowSyncButton = isOnline && pendingCount > 0 && (status as any) !== 'syncing';

  return (
    <div
      className="flex items-center gap-2 text-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Icon
        name={getStatusIcon()}
        size="sm"
        className={`${getStatusColor()} ${(status as any) === 'syncing' ? 'animate-spin' : ''}`}
        aria-hidden={true}
      />
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      
      {/* Manual Sync Button */}
      {shouldShowSyncButton && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleManualSync}
          disabled={isSyncingManually || (status as any) === 'syncing'}
          className="ml-2"
          aria-label="Manually sync pending actions"
        >
          <Icon
            name="RefreshCw"
            size="sm"
            className={isSyncingManually ? 'animate-spin' : ''}
            aria-hidden={true}
          />
          <span className="ml-1">Sync</span>
        </Button>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
