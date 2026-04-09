import React from 'react'
import { Icon } from './Icon'

interface TagProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onRemove?: () => void
  icon?: React.ReactNode
  className?: string
}

const variantStyles = {
  primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
  secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
  success: 'bg-success-100 text-success-800 hover:bg-success-200',
  warning: 'bg-warning-100 text-warning-800 hover:bg-warning-200',
  danger: 'bg-danger-100 text-danger-800 hover:bg-danger-200',
  neutral: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
}

export const Tag: React.FC<TagProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  onRemove,
  icon,
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors'

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      role="status"
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
          aria-label={`Remove ${children}`}
          type="button"
        >
          <Icon name="X" size="sm" color="inherit" />
        </button>
      )}
    </span>
  )
}
