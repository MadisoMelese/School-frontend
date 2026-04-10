import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { useOffline } from '@hooks/useOffline';
import { manualSync } from '@services/offline/syncEngine';

/**
 * ManualSyncButton Component
 * 
 * Provides a button to manually trigger sync of pending offline actions.
 * Displays sync status and provides user feedback.
 * 
 * Features:
 * - Manual sync trigger
 * - Loading state during sync
 * - Success/error feedback
 * - Disabled when offline or no pending actions
 * - Mobile-friendly touch target
 * - Accessible with ARIA labels
 */

interface ManualSyncButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ManualSyncButton: React.FC<ManualSyncButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const { isOnline, syncStatus, getPendingActionCount } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<'success' | 'error' | null>(null);
  const pendingCount = getPendingActionCount();

  const handleSync = async () => {
    if (!isOnline || isSyncing || pendingCount === 0) {
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      await manualSync();
      setSyncResult('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncResult(null);
      }, 3000);
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncResult('error');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSyncResult(null);
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const isDisabled = !isOnline || pendingCount === 0 || isSyncing || syncStatus === 'syncing';

  const getButtonLabel = () => {
    if (syncResult === 'success') return 'Synced!';
    if (syncResult === 'error') return 'Sync failed';
    if (isSyncing || syncStatus === 'syncing') return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (pendingCount === 0) return 'No pending actions';
    return `Sync ${pendingCount} action${pendingCount > 1 ? 's' : ''}`;
  };

  const getIconName = () => {
    if (syncResult === 'success') return 'CheckCircle';
    if (syncResult === 'error') return 'AlertCircle';
    return 'RefreshCw';
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isDisabled}
      className={className}
      aria-label={`Manual sync: ${getButtonLabel()}`}
      aria-busy={isSyncing || syncStatus === 'syncing'}
    >
      <Icon
        name={getIconName()}
        size={size === 'sm' ? 'sm' : 'md'}
        className={isSyncing || syncStatus === 'syncing' ? 'animate-spin' : ''}
        aria-hidden={true}
      />
      {showLabel && <span className="ml-2">{getButtonLabel()}</span>}
    </Button>
  );
};

export default ManualSyncButton;
