import React, { useEffect } from 'react'
import { Icon } from '../atoms/Icon'

interface NotificationToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const typeConfig = {
  success: {
    icon: 'CheckCircle',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
  },
  error: {
    icon: 'AlertCircle',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: 'AlertTriangle',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',
  },
  info: {
    icon: 'Info',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
  },
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  action,
  className,
}) => {
  const config = typeConfig[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg animate-slide-in-top ${className || ''}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon
          name={config.icon as any}
          size="md"
          className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
        </div>

        {/* Action button or close button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {action && (
            <button
              onClick={action.onClick}
              className={`text-sm font-medium ${config.textColor} hover:opacity-75 transition-opacity`}
            >
              {action.label}
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-1 ${config.textColor} hover:opacity-75 transition-opacity`}
            aria-label="Close notification"
          >
            <Icon name="X" size="md" />
          </button>
        </div>
      </div>
    </div>
  )
}
