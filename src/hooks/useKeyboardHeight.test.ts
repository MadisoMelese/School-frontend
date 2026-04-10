import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardHeight } from './useKeyboardHeight';

describe('useKeyboardHeight', () => {
  let originalInnerHeight: number;
  let originalScreenHeight: number;

  beforeEach(() => {
    originalInnerHeight = window.innerHeight;
    originalScreenHeight = window.screen.height;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: originalInnerHeight,
    });
    Object.defineProperty(window, 'screen', {
      writable: true,
      value: { height: originalScreenHeight },
    });
  });

  it('should initialize with keyboard hidden', () => {
    const { result } = renderHook(() => useKeyboardHeight());

    expect(result.current.keyboardHeight).toBe(0);
    expect(result.current.isKeyboardVisible).toBe(false);
  });

  it('should detect keyboard when viewport height decreases', () => {
    const { result } = renderHook(() => useKeyboardHeight());

    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isKeyboardVisible).toBe(true);
    expect(result.current.keyboardHeight).toBeGreaterThan(0);
  });

  it('should detect keyboard hide when viewport height increases', () => {
    const { result } = renderHook(() => useKeyboardHeight());

    // Show keyboard
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isKeyboardVisible).toBe(true);

    // Hide keyboard
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: originalInnerHeight,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });

  it('should ignore small viewport changes (< 50px)', () => {
    const { result } = renderHook(() => useKeyboardHeight());

    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: originalInnerHeight - 30, // Small change
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });

  it('should calculate correct keyboard height', () => {
    const { result } = renderHook(() => useKeyboardHeight());
    const expectedKeyboardHeight = 300;

    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: originalInnerHeight - expectedKeyboardHeight,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.keyboardHeight).toBe(expectedKeyboardHeight);
  });

  it('should handle multiple resize events', () => {
    const { result } = renderHook(() => useKeyboardHeight());

    // First resize - keyboard appears
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('resize'));
    });

    const firstHeight = result.current.keyboardHeight;
    expect(firstHeight).toBeGreaterThan(0);

    // Second resize - keyboard height changes
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 350,
      });
      window.dispatchEvent(new Event('resize'));
    });

    const secondHeight = result.current.keyboardHeight;
    expect(secondHeight).toBeGreaterThan(firstHeight);
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardHeight());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
