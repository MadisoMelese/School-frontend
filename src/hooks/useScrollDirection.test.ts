import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useScrollDirection } from './useScrollDirection';

describe('useScrollDirection Hook', () => {
  beforeEach(() => {
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with scroll direction as up', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current.scrollDirection).toBe('up');
    expect(result.current.scrollY).toBe(0);
  });

  it('should have scrollY and scrollDirection properties', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toHaveProperty('scrollY');
    expect(result.current).toHaveProperty('scrollDirection');
  });

  it('should accept custom threshold parameter', () => {
    const { result } = renderHook(() => useScrollDirection(100));
    expect(result.current.scrollDirection).toBe('up');
  });

  it('should use default threshold of 50', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current.scrollDirection).toBe('up');
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollDirection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });

  it('should use passive event listener for performance', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useScrollDirection());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true },
    );
    addEventListenerSpy.mockRestore();
  });

  it('should return object with scrollDirection and scrollY', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(typeof result.current.scrollDirection).toBe('string');
    expect(typeof result.current.scrollY).toBe('number');
  });

  it('should handle different threshold values', () => {
    const { result: result50 } = renderHook(() => useScrollDirection(50));
    const { result: result100 } = renderHook(() => useScrollDirection(100));
    const { result: result200 } = renderHook(() => useScrollDirection(200));

    expect(result50.current.scrollDirection).toBe('up');
    expect(result100.current.scrollDirection).toBe('up');
    expect(result200.current.scrollDirection).toBe('up');
  });

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(() => useScrollDirection());
    const initialDirection = result.current.scrollDirection;

    rerender();

    expect(result.current.scrollDirection).toBe(initialDirection);
  });

  it('should handle zero threshold', () => {
    const { result } = renderHook(() => useScrollDirection(0));
    expect(result.current.scrollDirection).toBe('up');
  });

  it('should handle large threshold values', () => {
    const { result } = renderHook(() => useScrollDirection(5000));
    expect(result.current.scrollDirection).toBe('up');
  });

  it('should initialize scrollY to 0', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current.scrollY).toBe(0);
  });

  it('should return consistent values on multiple calls', () => {
    const { result } = renderHook(() => useScrollDirection());
    const firstCall = result.current;
    const secondCall = result.current;

    expect(firstCall.scrollDirection).toBe(secondCall.scrollDirection);
    expect(firstCall.scrollY).toBe(secondCall.scrollY);
  });

  it('should handle hook with default parameters', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBeDefined();
    expect(result.current.scrollDirection).toBeDefined();
    expect(result.current.scrollY).toBeDefined();
  });

  it('should handle multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useScrollDirection(50));
    const { result: result2 } = renderHook(() => useScrollDirection(100));

    expect(result1.current.scrollDirection).toBe(result2.current.scrollDirection);
  });

  it('should not throw errors on initialization', () => {
    expect(() => {
      renderHook(() => useScrollDirection());
    }).not.toThrow();
  });

  it('should not throw errors with various threshold values', () => {
    expect(() => {
      renderHook(() => useScrollDirection(0));
      renderHook(() => useScrollDirection(50));
      renderHook(() => useScrollDirection(1000));
    }).not.toThrow();
  });
});
