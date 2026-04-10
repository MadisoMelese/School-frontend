import React from 'react'
import { Icon } from './Icon'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    const labelSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }

    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer min-h-[44px] px-2 py-2 -mx-2 -my-2 rounded-lg hover:bg-neutral-50 transition-colors">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              className={`
                ${sizeClasses[size]}
                appearance-none
                border-2
                border-neutral-300
                rounded
                cursor-pointer
                transition-all
                duration-200
                checked:bg-primary-600
                checked:border-primary-600
                hover:border-primary-400
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:outline-none
                focus:ring-2
                focus:ring-primary-500
                focus:ring-offset-2
                ${className}
              `}
              {...props}
            />
            {props.checked && (
              <Icon
                name="Check"
                size={size === 'sm' ? 14 : size === 'md' ? 16 : 18}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none"
              />
            )}
          </div>
          {label && (
            <span
              className={`
                ${labelSizeClasses[size]}
                font-medium
                text-neutral-700
                ${disabled ? 'opacity-50' : ''}
              `}
            >
              {label}
            </span>
          )}
        </label>
        {error && <p className="text-xs text-danger-600">{error}</p>}
        {helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
