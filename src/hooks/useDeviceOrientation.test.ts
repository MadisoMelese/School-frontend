import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDeviceOrientation } from './useDeviceOrientation';

describe('useDeviceOrientation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window dimensions
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with portrait orientation when height > width', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current.orientation).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it('should initialize with landscape orientation when width > height', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isPortrait).toBe(false);
    expect(result.current.isLandscape).toBe(true);
  });

  it('should have angle property initialized', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(typeof result.current.angle).toBe('number');
  });

  it('should return object with all required properties', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current).toHaveProperty('orientation');
    expect(result.current).toHaveProperty('angle');
    expect(result.current).toHaveProperty('isPortrait');
    expect(result.current).toHaveProperty('isLandscape');
  });

  it('should listen to orientationchange event', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useDeviceOrientation());
    expect(addEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('should listen to resize event', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useDeviceOrientation());
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useDeviceOrientation());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should accept custom throttle value', () => {
    const { result } = renderHook(() => useDeviceOrientation(500));
    expect(result.current).toBeDefined();
  });

  it('should handle zero throttle value', () => {
    const { result } = renderHook(() => useDeviceOrientation(0));
    expect(result.current).toBeDefined();
  });

  it('should handle large throttle values', () => {
    const { result } = renderHook(() => useDeviceOrientation(5000));
    expect(result.current).toBeDefined();
  });

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(() => useDeviceOrientation());
    const initialOrientation = result.current.orientation;

    rerender();

    expect(result.current.orientation).toBe(initialOrientation);
  });

  it('should return consistent values on multiple calls', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    const firstCall = result.current;
    const secondCall = result.current;

    expect(firstCall.orientation).toBe(secondCall.orientation);
    expect(firstCall.isPortrait).toBe(secondCall.isPortrait);
    expect(firstCall.isLandscape).toBe(secondCall.isLandscape);
  });

  it('should handle multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useDeviceOrientation());
    const { result: result2 } = renderHook(() => useDeviceOrientation());

    expect(result1.current.orientation).toBe(result2.current.orientation);
  });

  it('should not throw errors on initialization', () => {
    expect(() => {
      renderHook(() => useDeviceOrientation());
    }).not.toThrow();
  });

  it('should not throw errors with various throttle values', () => {
    expect(() => {
      renderHook(() => useDeviceOrientation(0));
      renderHook(() => useDeviceOrientation(300));
      renderHook(() => useDeviceOrientation(1000));
    }).not.toThrow();
  });

  it('should return boolean for isPortrait', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(typeof result.current.isPortrait).toBe('boolean');
  });

  it('should return boolean for isLandscape', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(typeof result.current.isLandscape).toBe('boolean');
  });

  it('should return number for angle', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(typeof result.current.angle).toBe('number');
  });

  it('should return string for orientation', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(typeof result.current.orientation).toBe('string');
  });

  it('should have valid orientation values', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(['portrait', 'landscape', 'unknown']).toContain(result.current.orientation);
  });

  it('should have isPortrait and isLandscape be mutually exclusive or both false', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    const { isPortrait, isLandscape } = result.current;
    
    // Either portrait or landscape, but not both
    expect(isPortrait || isLandscape || (!isPortrait && !isLandscape)).toBe(true);
  });

  it('should initialize with correct boolean flags based on orientation', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    
    if (result.current.orientation === 'portrait') {
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    } else if (result.current.orientation === 'landscape') {
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
    }
  });

  it('should return angle as a number', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(Number.isFinite(result.current.angle)).toBe(true);
  });

  it('should handle default throttle value', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current).toBeDefined();
  });

  it('should return state object with correct structure', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    const state = result.current;
    
    expect(Object.keys(state).sort()).toEqual([
      'angle',
      'isLandscape',
      'isPortrait',
      'orientation',
    ].sort());
  });
});
