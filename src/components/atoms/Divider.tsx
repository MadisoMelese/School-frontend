import React from 'react'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  label?: string
  className?: string
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  className,
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={`h-full w-px bg-neutral-200 ${className || ''}`}
        role="separator"
        aria-orientation="vertical"
      />
    )
  }

  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className || ''}`} role="separator">
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-sm text-neutral-500 font-medium">{label}</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
    )
  }

  return (
    <div
      className={`h-px bg-neutral-200 ${className || ''}`}
      role="separator"
      aria-orientation="horizontal"
    />
  )
}
