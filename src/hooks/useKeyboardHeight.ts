import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to detect mobile keyboard height
 * Supports both iOS and Android keyboard behaviors
 * 
 * Returns the height of the visible keyboard in pixels
 * Returns 0 when keyboard is hidden
 */
export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    // Store initial viewport height
    const initialViewportHeight = window.innerHeight

    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDifference = initialViewportHeight - currentHeight

      // Keyboard is visible if viewport height decreased significantly
      // Use 50px threshold to avoid false positives from address bar
      if (heightDifference > 50) {
        setKeyboardHeight(heightDifference)
        setIsKeyboardVisible(true)
      } else {
        setKeyboardHeight(0)
        setIsKeyboardVisible(false)
      }
    }

    // iOS: Use visualViewport for more accurate detection
    if (window.visualViewport) {
      const handleVisualViewportResize = () => {
        const visualHeight = window.visualViewport?.height || 0
        const screenHeight = window.screen.height
        const heightDifference = screenHeight - visualHeight

        if (heightDifference > 50) {
          setKeyboardHeight(heightDifference)
          setIsKeyboardVisible(true)
        } else {
          setKeyboardHeight(0)
          setIsKeyboardVisible(false)
        }
      }

      window.visualViewport.addEventListener('resize', handleVisualViewportResize)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportResize)
      }
    }

    // Fallback: Use window resize event
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { keyboardHeight, isKeyboardVisible }
}
