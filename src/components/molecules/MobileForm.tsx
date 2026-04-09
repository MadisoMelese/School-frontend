import React, { useRef, useEffect, useCallback } from 'react'
import { useMobileKeyboard } from '../../hooks/useMobileKeyboard'

interface MobileFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
  className?: string
  dismissKeyboardOnSubmit?: boolean
  maintainScrollPosition?: boolean
  onKeyboardShow?: () => void
  onKeyboardHide?: () => void
}

/**
 * Mobile-optimized form component that handles keyboard events
 * Features:
 * - Automatic keyboard dismissal on submit
 * - Scroll position maintenance
 * - Keyboard event callbacks
 * - Escape key to dismiss keyboard
 * - Enter key to submit (configurable)
 */
export const MobileForm: React.FC<MobileFormProps> = ({
  onSubmit,
  children,
  className = '',
  dismissKeyboardOnSubmit = true,
  maintainScrollPosition = true,
  onKeyboardShow,
  onKeyboardHide,
}) => {
  const formRef = useRef<HTMLFormElement>(null)
  const { dismissKeyboard, maintainScrollPosition: maintainScroll, isKeyboardVisible } =
    useMobileKeyboard({
      onKeyboardShow,
      onKeyboardHide,
    })

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (dismissKeyboardOnSubmit) {
        dismissKeyboard()
      }

      if (maintainScrollPosition) {
        maintainScroll()
      }

      onSubmit(e)
    },
    [onSubmit, dismissKeyboardOnSubmit, maintainScrollPosition, dismissKeyboard, maintainScroll]
  )

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to dismiss keyboard
      if (e.key === 'Escape' && isKeyboardVisible) {
        e.preventDefault()
        dismissKeyboard()
      }

      // Enter key to submit (only if not in textarea)
      if (
        e.key === 'Enter' &&
        e.ctrlKey &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        formRef.current?.dispatchEvent(new Event('submit', { bubbles: true }))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isKeyboardVisible, dismissKeyboard])

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`w-full ${className}`}
      noValidate
    >
      {children}
    </form>
  )
}
