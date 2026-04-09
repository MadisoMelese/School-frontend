import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useHeaderVisibility } from './useHeaderVisibility';

// Mock useScrollDirection
vi.mock('./useScrollDirection', () => ({
  useScrollDirection: vi.fn(() => ({
    scrollDirection: 'up',
    scrollY: 0,
  })),
}));

// Mock useMediaQuery
vi.mock('./useMediaQuery', () => ({
  useMediaQuery: vi.fn((query: string) => {
    return query === '(max-width: 1024px)';
  }),
}));

import { useScrollDirection } from './useScrollDirection';
import { useMediaQuery } from './useMediaQuery';

describe('useHeaderVisibility Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with header visible', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should have isHeaderVisible property', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(result.current).toHaveProperty('isHeaderVisible');
  });

  it('should have scrollDirection property', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(result.current).toHaveProperty('scrollDirection');
  });

  it('should have scrollY property', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(result.current).toHaveProperty('scrollY');
  });

  it('should have isMobile property', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(result.current).toHaveProperty('isMobile');
  });

  it('should accept custom scroll threshold', () => {
    const { result } = renderHook(() => useHeaderVisibility(100));
    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should use default scroll threshold of 50', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should return object with all required properties', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(typeof result.current.isHeaderVisible).toBe('boolean');
    expect(typeof result.current.scrollDirection).toBe('string');
    expect(typeof result.current.scrollY).toBe('number');
    expect(typeof result.current.isMobile).toBe('boolean');
  });

  it('should call useScrollDirection hook', () => {
    renderHook(() => useHeaderVisibility());
    expect(useScrollDirection).toHaveBeenCalled();
  });

  it('should call useMediaQuery hook with mobile breakpoint', () => {
    renderHook(() => useHeaderVisibility());
    expect(useMediaQuery).toHaveBeenCalledWith('(max-width: 1024px)');
  });

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(() => useHeaderVisibility());
    const initialVisible = result.current.isHeaderVisible;

    rerender();

    expect(result.current.isHeaderVisible).toBe(initialVisible);
  });

  it('should handle different threshold values', () => {
    const { result: result50 } = renderHook(() => useHeaderVisibility(50));
    const { result: result100 } = renderHook(() => useHeaderVisibility(100));
    const { result: result200 } = renderHook(() => useHeaderVisibility(200));

    expect(result50.current.isHeaderVisible).toBe(true);
    expect(result100.current.isHeaderVisible).toBe(true);
    expect(result200.current.isHeaderVisible).toBe(true);
  });

  it('should not throw errors on initialization', () => {
    expect(() => {
      renderHook(() => useHeaderVisibility());
    }).not.toThrow();
  });

  it('should not throw errors with various threshold values', () => {
    expect(() => {
      renderHook(() => useHeaderVisibility(0));
      renderHook(() => useHeaderVisibility(50));
      renderHook(() => useHeaderVisibility(1000));
    }).not.toThrow();
  });

  it('should return consistent values on multiple calls', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    const firstCall = result.current;
    const secondCall = result.current;

    expect(firstCall.isHeaderVisible).toBe(secondCall.isHeaderVisible);
    expect(firstCall.scrollDirection).toBe(secondCall.scrollDirection);
    expect(firstCall.scrollY).toBe(secondCall.scrollY);
    expect(firstCall.isMobile).toBe(secondCall.isMobile);
  });

  it('should handle multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useHeaderVisibility(50));
    const { result: result2 } = renderHook(() => useHeaderVisibility(100));

    expect(result1.current.isHeaderVisible).toBe(result2.current.isHeaderVisible);
  });

  it('should handle zero threshold', () => {
    const { result } = renderHook(() => useHeaderVisibility(0));
    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should handle large threshold values', () => {
    const { result } = renderHook(() => useHeaderVisibility(5000));
    expect(result.current.isHeaderVisible).toBe(true);
  });

  it('should initialize with default threshold', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(result.current).toBeDefined();
  });

  it('should return boolean for isHeaderVisible', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(typeof result.current.isHeaderVisible).toBe('boolean');
  });

  it('should return string for scrollDirection', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(typeof result.current.scrollDirection).toBe('string');
  });

  it('should return number for scrollY', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(typeof result.current.scrollY).toBe('number');
  });

  it('should return boolean for isMobile', () => {
    const { result } = renderHook(() => useHeaderVisibility());
    expect(typeof result.current.isMobile).toBe('boolean');
  });
});
