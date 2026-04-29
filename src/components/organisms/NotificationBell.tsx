import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@components/atoms/Icon';
import { Badge } from '@components/atoms/Badge';
import { useNotificationStore } from '@store/notificationStore';
import type { AppNotification } from '@store/notificationStore';

/**
 * NotificationBell
 * Displays real-time notification count and dropdown list.
 */
export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead } =
    useNotificationStore();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'message': return 'Mail';
      case 'announcement': return 'Megaphone';
      case 'grade': return 'BookOpen';
      case 'attendance': return 'Calendar';
      case 'fee': return 'CreditCard';
      default: return 'Bell';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label={`Notifications${unreadNotificationCount > 0 ? ` (${unreadNotificationCount} unread)` : ''}`}
      >
        <Icon name="Bell" size={22} className="text-neutral-600 dark:text-neutral-300" />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800 z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                <Icon name="BellOff" size={32} className="mb-2 opacity-40" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-0 ${
                    !notif.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 rounded-full p-1.5 ${
                    !notif.isRead ? 'bg-primary-100 dark:bg-primary-800' : 'bg-neutral-100 dark:bg-neutral-700'
                  }`}>
                    <Icon
                      name={getNotificationIcon(notif.type)}
                      size={14}
                      className={!notif.isRead ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      !notif.isRead ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">{formatTime(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
