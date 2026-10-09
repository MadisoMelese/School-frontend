import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@components/atoms/Icon';
import { useNotificationStore } from '@store/notificationStore';
import { useAuthStore } from '@store/authStore';
import { apiClient } from '@services/api/client';

/**
 * NotificationBell
 * - Badge shows unreadMessageCount (authoritative server count, no double-counting)
 * - Dropdown groups messages by sender — one row per sender with unread count
 * - Clicking a sender row navigates to the messages page and marks them read
 */
export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [markAllError, setMarkAllError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    unreadMessageCount,
    markSenderRead,
    markAllRead,
    getGroupedMessageNotifications,
  } = useNotificationStore();

  const grouped = getGroupedMessageNotifications();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSenderClick = (senderId: string) => {
    markSenderRead(senderId);
    setIsOpen(false);
    // Navigate to the messages page for the current role
    const role = user?.role ?? 'student';
    const path = role === 'admin' ? '/admin/messages' : `/${role}/messages`;
    navigate(path);
  };

  const handleMarkAllRead = async () => {
    setMarkAllError(null);
    try {
      await apiClient.patch('/messages/read-all');
      markAllRead();
      setUnreadMessageCount(0);
    } catch (error) {
      setMarkAllError(error instanceof Error ? error.message : 'Failed to mark messages as read');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label={`Notifications${unreadMessageCount > 0 ? ` (${unreadMessageCount} unread)` : ''}`}
      >
        <Icon name="Bell" size={22} className="text-neutral-600 dark:text-neutral-300" />
        {unreadMessageCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800 z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Messages
              {unreadMessageCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 text-xs font-semibold">
                  {unreadMessageCount} new
                </span>
              )}
            </h3>
            {grouped.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {markAllError && (
            <p className="px-4 py-2 text-xs text-danger-600 dark:text-danger-400" role="alert">
              {markAllError}
            </p>
          )}

          {/* Grouped sender list */}
          <div className="max-h-80 overflow-y-auto">
            {grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                <Icon name="BellOff" size={32} className="mb-2 opacity-40" />
                <p className="text-sm">No new messages</p>
              </div>
            ) : (
              grouped.map((group) => (
                <button
                  key={group.senderId}
                  onClick={() => handleSenderClick(group.senderId)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-0 bg-primary-50 dark:bg-primary-900/20"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold select-none">
                    {group.senderName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        {group.senderName}
                      </p>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap flex-shrink-0">
                        {formatTime(group.latestTime)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {group.latestMessage}
                    </p>
                  </div>

                  {/* Unread count badge */}
                  <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {group.count > 99 ? '99+' : group.count}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer — link to messages */}
          {grouped.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-2.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  const role = user?.role ?? 'student';
                  const path = role === 'admin' ? '/admin/messages' : `/${role}/messages`;
                  navigate(path);
                }}
                className="w-full text-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium py-1"
              >
                Open Messages →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
