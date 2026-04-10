import React, { useState } from 'react'
import { User, Message } from '../../types'
import { Avatar } from '../atoms/Avatar'
import { Icon } from '../atoms/Icon'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { useHeaderVisibility } from '../../hooks/useHeaderVisibility'

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

export interface HeaderProps {
  title?: string
  user?: User
  notifications?: Notification[]
  onNotificationClick?: (notificationId: string) => void
  onLogout?: () => void
  onThemeToggle?: () => void
  onMenuToggle?: () => void
  enableScrollHiding?: boolean
  scrollHideThreshold?: number
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isHeaderVisible } = useHeaderVisibility(scrollHideThreshold)

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'CheckCircle'
      case 'warning':
        return 'AlertCircle'
      case 'error':
        return 'XCircle'
      default:
        return 'Info'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success-600'
      case 'warning':
        return 'text-warning-600'
      case 'error':
        return 'text-danger-600'
      default:
        return 'text-primary-600'
    }
  }

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

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Icon name="Bell" size={20} className="text-neutral-600 dark:text-neutral-400" />
              {unreadCount > 0 && (
                <Badge
                  variant="danger"
                  className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center p-0"
                >
                  {unreadCount}
                </Badge>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          if (onNotificationClick) {
                            onNotificationClick(notification.id)
                          }
                          setNotificationsOpen(false)
                        }}
                        className={`w-full px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                          !notification.read ? 'bg-primary-50 dark:bg-primary-900' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <Icon
                            name={getNotificationIcon(notification.type)}
                            size={20}
                            className={getNotificationColor(notification.type)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-neutral-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.firstname} {user.lastname}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{user.role}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      <Icon name="User" size={16} />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
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
                          onLogout()
                        }
                        setUserMenuOpen(false)
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
  )
}
