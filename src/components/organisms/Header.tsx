import React, { useState } from 'react';
import { User } from '../../types';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { useHeaderVisibility } from '../../hooks/useHeaderVisibility';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { ManualSyncButton } from './ManualSyncButton';
import { NotificationBell } from './NotificationBell';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface HeaderProps {
  title?: string;
  user?: User;
  notifications?: Notification[];
  onNotificationClick?: (notificationId: string) => void;
  onLogout?: () => void;
  onThemeToggle?: () => void;
  onMenuToggle?: () => void;
  enableScrollHiding?: boolean;
  scrollHideThreshold?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'SchoolOS',
  user,
  notifications = [],
  onNotificationClick,
  onLogout,
  onThemeToggle,
  onMenuToggle,
  enableScrollHiding = true,
  scrollHideThreshold = 50,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isHeaderVisible } = useHeaderVisibility(scrollHideThreshold);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertCircle';
      case 'error':
        return 'XCircle';
      default:
        return 'Info';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success-600';
      case 'warning':
        return 'text-warning-600';
      case 'error':
        return 'text-danger-600';
      default:
        return 'text-primary-600';
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm transition-transform duration-300 ease-in-out ${
        enableScrollHiding && !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left Section - Title */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
            aria-label="Toggle menu"
          >
            <Icon name="Menu" size={24} className="text-neutral-900 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h1>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Sync Status Indicator */}
          <div className="hidden md:block">
            <SyncStatusIndicator />
          </div>

          {/* Manual Sync Button */}
          <div className="hidden sm:block">
            <ManualSyncButton variant="secondary" size="sm" showLabel={false} />
          </div>

          {/* Theme Toggle */}
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              <Icon name="Moon" size={20} className="text-neutral-600 dark:text-neutral-400" />
            </button>
          )}

          {/* Real-time Notifications */}
          <NotificationBell />

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                aria-expanded={userMenuOpen}
                aria-label="User menu"
              >
                <Avatar name={`${user.firstname} ${user.lastname}`} src={user.avatar} size="sm" />
                <Icon
                  name={userMenuOpen ? 'ChevronUp' : 'ChevronDown'}
                  size={16}
                  className="text-neutral-400 dark:text-neutral-500"
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      {user.role}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      <Icon name="User" size={16} />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      <Icon name="Settings" size={16} />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-neutral-200 dark:border-neutral-700 py-1">
                    <button
                      onClick={() => {
                        if (onLogout) {
                          onLogout();
                        }
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900 transition-colors flex items-center gap-2"
                    >
                      <Icon name="LogOut" size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
