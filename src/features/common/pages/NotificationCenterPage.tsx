import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Card } from '@components/molecules/Card'
import { Button } from '@components/atoms/Button'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import { Spinner } from '@components/atoms/Spinner'
import { notificationService } from '@services/api/notificationService'

/**
 * Notification Center Page
 * Displays all notifications in a centralized location
 * - View all notifications
 * - Filter by type
 * - Mark as read
 * - Delete notifications
 */

interface Notification {
  id: string;
  type: 'exam_result' | 'exam_reminder' | 'message' | 'fee' | 'attendance' | 'announcement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

const notificationTypeConfig = {
  exam_result: {
    icon: 'BookOpen',
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    label: 'Exam Result',
  },
  exam_reminder: {
    icon: 'Clock',
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    label: 'Exam Reminder',
  },
  message: {
    icon: 'Mail',
    color: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-900',
    label: 'Message',
  },
  fee: {
    icon: 'DollarSign',
    color: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    label: 'Fee',
  },
  attendance: {
    icon: 'CheckCircle',
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    label: 'Attendance',
  },
  announcement: {
    icon: 'Megaphone',
    color: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-900',
    label: 'Announcement',
  },
}

export const NotificationCenterPage: React.FC = () => {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await notificationService.getNotifications({
          limit: 50,
        })
        setNotifications(result.notifications)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  // Filter notifications
  const filteredNotifications = selectedFilter
    ? notifications.filter((n) => n.type === selectedFilter)
    : notifications

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <DashboardLayout title="Notifications" description="View all your notifications">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Notifications" description="View all your notifications">
        <Card>
          <div className="text-center py-8">
            <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
            <p className="text-danger-600 font-medium">{error}</p>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Notifications" description="View all your notifications">
      <div className="space-y-6">
        {/* Header with unread count */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-neutral-600 mt-1">
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedFilter === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedFilter(null)}
          >
            All
          </Button>
          {Object.entries(notificationTypeConfig).map(([type, config]) => (
            <Button
              key={type}
              variant={selectedFilter === type ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedFilter(type)}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Icon name="Bell" size={32} className="text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">
                {selectedFilter ? 'No notifications of this type' : 'No notifications yet'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = notificationTypeConfig[notification.type]
              return (
                <Card
                  key={notification.id}
                  className={`${config.color} border ${config.borderColor} cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.isRead ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <Icon
                        name={config.icon as any}
                        size={24}
                        className={config.textColor}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-semibold ${config.textColor}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm ${config.textColor} mt-1`}>
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Badge variant="primary" size="sm">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Timestamp */}
                      <p className={`text-xs ${config.textColor} opacity-75 mt-2`}>
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default NotificationCenterPage
