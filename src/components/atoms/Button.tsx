import React from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles = {
  primary:
    'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 active:bg-primary-700 dark:active:bg-primary-800 disabled:bg-primary-300 dark:disabled:bg-primary-900',
  secondary:
    'bg-secondary-500 dark:bg-secondary-600 text-white hover:bg-secondary-600 dark:hover:bg-secondary-700 active:bg-secondary-700 dark:active:bg-secondary-800 disabled:bg-secondary-300 dark:disabled:bg-secondary-900',
  danger:
    'bg-danger-500 dark:bg-danger-600 text-white hover:bg-danger-600 dark:hover:bg-danger-700 active:bg-danger-700 dark:active:bg-danger-800 disabled:bg-danger-300 dark:disabled:bg-danger-900',
  ghost:
    'bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 dark:active:bg-neutral-600 disabled:text-neutral-300 dark:disabled:text-neutral-600',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[44px] min-w-[44px]',
  md: 'px-4 py-2.5 text-base min-h-[44px] min-w-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[44px] min-w-[44px]',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-primary-500 dark:focus:ring-primary-400 disabled:cursor-not-allowed'

  const widthStyle = fullWidth ? 'w-full' : ''
  const disabledState = disabled || loading

  return (
    <button
      disabled={disabledState}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className || ''}`}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" color={variant === 'ghost' ? 'primary' : 'inherit'} />
          <span className="ml-2">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
