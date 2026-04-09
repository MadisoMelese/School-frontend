import React from 'react'
import * as Icons from 'lucide-react'

interface IconProps {
  name: keyof typeof Icons
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
  className?: string
  strokeWidth?: number
  'aria-hidden'?: boolean
  'aria-label'?: string
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

const colorStyles = {
  inherit: 'text-current',
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  danger: 'text-danger-500',
  neutral: 'text-neutral-500',
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'inherit',
  className,
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  ...props
}) => {
  const IconComponent = Icons[name] as React.ComponentType<any>

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`)
    return null
  }

  const sizeValue = typeof size === 'number' ? size : sizeMap[size]

  return (
    <IconComponent
      size={sizeValue}
      strokeWidth={strokeWidth}
      className={`${colorStyles[color]} ${className || ''}`}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      {...props}
    />
  )
}
