import React, { useRef, useEffect } from 'react'

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  helperText?: string
  onKeyboardDismiss?: () => void
  autoFocusOnMount?: boolean
  scrollIntoViewOnFocus?: boolean
  autoResize?: boolean
}

/**
 * Mobile-optimized textarea component with keyboard handling
 * Features:
 * - Auto-resize based on content
 * - Scroll into view on focus
 * - Keyboard dismissal callback
 * - Touch-friendly tap targets
 * - Proper ARIA labels
 * - Escape key to dismiss keyboard
 */
export const MobileTextarea: React.FC<MobileTextareaProps> = ({
  error,
  label,
  helperText,
  id,
  className,
  disabled,
  onKeyboardDismiss,
  autoFocusOnMount = false,
  scrollIntoViewOnFocus = true,
  autoResize = true,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${textareaId}-error` : undefined
  const helperId = helperText ? `${textareaId}-helper` : undefined

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocusOnMount && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocusOnMount])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || !autoResize) return

    const handleInput = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`
    }

    textarea.addEventListener('input', handleInput)
    return () => {
      textarea.removeEventListener('input', handleInput)
    }
  }, [autoResize])

  // Handle focus to scroll into view
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (scrollIntoViewOnFocus) {
      requestAnimationFrame(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
    props.onFocus?.(e)
  }

  // Handle blur to dismiss keyboard
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    onKeyboardDismiss?.()
    props.onBlur?.(e)
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape key to dismiss keyboard
    if (e.key === 'Escape') {
      e.currentTarget.blur()
      onKeyboardDismiss?.()
    }

    // Ctrl+Enter to submit (common pattern)
    if (e.key === 'Enter' && e.ctrlKey) {
      e.currentTarget.blur()
      onKeyboardDismiss?.()
    }

    props.onKeyDown?.(e)
  }

  const baseStyles =
    'w-full px-3 py-2.5 text-base rounded-lg border-2 transition-colors duration-200 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed min-h-[120px] resize-none'

  const borderStyle = error
    ? 'border-danger-500 focus:border-danger-600 focus:ring-2 focus:ring-danger-200'
    : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        id={textareaId}
        disabled={disabled}
        className={`${baseStyles} ${borderStyle} ${className || ''}`}
        aria-describedby={errorId || helperId}
        aria-invalid={!!error}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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
