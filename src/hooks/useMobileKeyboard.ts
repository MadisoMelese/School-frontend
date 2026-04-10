import { useState, useEffect, useRef, useCallback } from 'react'
import { useKeyboardHeight } from './useKeyboardHeight'

interface UseMobileKeyboardOptions {
  onKeyboardShow?: () => void
  onKeyboardHide?: () => void
  scrollIntoViewOptions?: ScrollIntoViewOptions
}

/**
 * Custom hook to manage mobile keyboard state and behavior
 * Handles:
 * - Keyboard appearance/disappearance
 * - Scroll to focused input
 * - Viewport adjustment
 * - Keyboard dismissal
 * - Keyboard events (show/hide)
 */
export const useMobileKeyboard = (options: UseMobileKeyboardOptions = {}) => {
  const { onKeyboardShow, onKeyboardHide, scrollIntoViewOptions } = options
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const [isKeyboardDismissing, setIsKeyboardDismissing] = useState(false)
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight()
  const previousKeyboardVisibleRef = useRef(isKeyboardVisible)

  // Track keyboard show/hide transitions
  useEffect(() => {
    if (isKeyboardVisible && !previousKeyboardVisibleRef.current) {
      // Keyboard appeared
      onKeyboardShow?.()
    } else if (!isKeyboardVisible && previousKeyboardVisibleRef.current) {
      // Keyboard disappeared
      onKeyboardHide?.()
      setIsKeyboardDismissing(false)
    }
    previousKeyboardVisibleRef.current = isKeyboardVisible
  }, [isKeyboardVisible, onKeyboardShow, onKeyboardHide])

  // Scroll focused input into view when keyboard appears
  useEffect(() => {
    if (isKeyboardVisible && focusedElement) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        focusedElement.scrollIntoView(
          scrollIntoViewOptions || { behavior: 'smooth', block: 'center' }
        )
      })
    }
  }, [isKeyboardVisible, focusedElement, scrollIntoViewOptions])

  // Track focus changes
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        setFocusedElement(target)
      }
    }

    const handleBlur = () => {
      setFocusedElement(null)
    }

    document.addEventListener('focus', handleFocus, true)
    document.addEventListener('blur', handleBlur, true)

    return () => {
      document.removeEventListener('focus', handleFocus, true)
      document.removeEventListener('blur', handleBlur, true)
    }
  }, [])

  // Dismiss keyboard
  const dismissKeyboard = useCallback(() => {
    setIsKeyboardDismissing(true)
    if (focusedElement) {
      (focusedElement as HTMLInputElement | HTMLTextAreaElement).blur()
    }
  }, [focusedElement])

  // Maintain scroll position when keyboard dismisses
  const maintainScrollPosition = useCallback(() => {
    if (focusedElement) {
      const scrollTop = window.scrollY
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollTop)
      })
    }
  }, [focusedElement])

  return {
    keyboardHeight,
    isKeyboardVisible,
    focusedElement,
    dismissKeyboard,
    maintainScrollPosition,
    isKeyboardDismissing,
  }
}
