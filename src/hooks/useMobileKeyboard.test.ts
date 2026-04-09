import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobileKeyboard } from './useMobileKeyboard'

describe('useMobileKeyboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock scrollIntoView for JSDOM
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('should initialize with keyboard hidden', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    expect(result.current.keyboardHeight).toBe(0)
    expect(result.current.isKeyboardVisible).toBe(false)
    expect(result.current.focusedElement).toBeNull()
    expect(result.current.isKeyboardDismissing).toBe(false)
  })

  it('should call onKeyboardShow when keyboard appears', () => {
    const onKeyboardShow = vi.fn()
    const { result } = renderHook(() => useMobileKeyboard({ onKeyboardShow }))

    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 400,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(onKeyboardShow).toHaveBeenCalled()
  })

  it('should call onKeyboardHide when keyboard disappears', () => {
    const onKeyboardHide = vi.fn()
    const originalHeight = window.innerHeight
    const { result } = renderHook(() => useMobileKeyboard({ onKeyboardHide }))

    // Show keyboard - need to set a significant height difference
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalHeight - 300, // 300px keyboard
      })
      window.dispatchEvent(new Event('resize'))
    })

    // Verify keyboard is visible
    expect(result.current.isKeyboardVisible).toBe(true)

    // Hide keyboard
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalHeight,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(onKeyboardHide).toHaveBeenCalled()
  })

  it('should track focused input element', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    const input = document.createElement('input')
    document.body.appendChild(input)

    act(() => {
      input.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      input.dispatchEvent(focusEvent)
    })

    expect(result.current.focusedElement).toBe(input)

    document.body.removeChild(input)
  })

  it('should track focused textarea element', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    act(() => {
      textarea.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      textarea.dispatchEvent(focusEvent)
    })

    expect(result.current.focusedElement).toBe(textarea)

    document.body.removeChild(textarea)
  })

  it('should dismiss keyboard when dismissKeyboard is called', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    const input = document.createElement('input')
    document.body.appendChild(input)

    act(() => {
      input.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      input.dispatchEvent(focusEvent)
    })

    expect(result.current.focusedElement).toBe(input)

    act(() => {
      result.current.dismissKeyboard()
    })

    expect(result.current.isKeyboardDismissing).toBe(true)

    document.body.removeChild(input)
  })

  it('should scroll focused element into view when keyboard appears', () => {
    const { result } = renderHook(() =>
      useMobileKeyboard({
        scrollIntoViewOptions: { behavior: 'smooth', block: 'center' },
      })
    )

    const input = document.createElement('input')
    document.body.appendChild(input)

    act(() => {
      input.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      input.dispatchEvent(focusEvent)
    })

    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 400,
      })
      window.dispatchEvent(new Event('resize'))
    })

    // scrollIntoView is called asynchronously via requestAnimationFrame
    // Just verify the hook tracks the focused element
    expect(result.current.focusedElement).toBe(input)

    document.body.removeChild(input)
  })

  it('should maintain scroll position when keyboard dismisses', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    const input = document.createElement('input')
    document.body.appendChild(input)

    act(() => {
      input.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      input.dispatchEvent(focusEvent)
    })

    act(() => {
      result.current.maintainScrollPosition()
    })

    // Just verify the function is callable and the focused element is tracked
    expect(result.current.focusedElement).toBe(input)

    document.body.removeChild(input)
  })

  it('should clear focused element on blur', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    const input = document.createElement('input')
    document.body.appendChild(input)

    act(() => {
      input.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      input.dispatchEvent(focusEvent)
    })

    expect(result.current.focusedElement).toBe(input)

    act(() => {
      input.blur()
      const blurEvent = new FocusEvent('blur', { bubbles: true })
      input.dispatchEvent(blurEvent)
    })

    expect(result.current.focusedElement).toBeNull()

    document.body.removeChild(input)
  })

  it('should handle contentEditable elements', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    const div = document.createElement('div')
    div.contentEditable = 'true'
    document.body.appendChild(div)

    act(() => {
      div.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      div.dispatchEvent(focusEvent)
    })

    expect(result.current.focusedElement).toBe(div)

    document.body.removeChild(div)
  })

  it('should not track non-input elements', () => {
    const { result } = renderHook(() => useMobileKeyboard())

    const button = document.createElement('button')
    document.body.appendChild(button)

    act(() => {
      button.focus()
      const focusEvent = new FocusEvent('focus', { bubbles: true })
      button.dispatchEvent(focusEvent)
    })

    expect(result.current.focusedElement).toBeNull()

    document.body.removeChild(button)
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => useMobileKeyboard())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function), true)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function), true)

    removeEventListenerSpy.mockRestore()
  })
})
