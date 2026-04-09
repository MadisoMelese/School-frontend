import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  error,
  label,
  helperText,
  id,
  className,
  disabled,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined

  const baseStyles =
    'w-full px-3 py-2.5 text-base rounded-lg border-2 transition-colors duration-200 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed min-h-[44px]'

  const borderStyle = error
    ? 'border-danger-500 focus:border-danger-600 focus:ring-2 focus:ring-danger-200'
    : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        className={`${baseStyles} ${borderStyle} ${className || ''}`}
        aria-describedby={errorId || helperId}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
