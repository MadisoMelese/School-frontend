import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useOrientationChange } from './useOrientationChange';

// Mock useDeviceOrientation
vi.mock('./useDeviceOrientation', () => ({
  useDeviceOrientation: vi.fn(() => ({
    orientation: 'portrait',
    angle: 0,
    isPortrait: true,
    isLandscape: false,
  })),
}));

describe('useOrientationChange Hook', () => {
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
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with portrait orientation', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(result.current.orientation).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it('should have angle property initialized', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(typeof result.current.angle).toBe('number');
  });

  it('should return object with all required properties', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(result.current).toHaveProperty('orientation');
    expect(result.current).toHaveProperty('angle');
    expect(result.current).toHaveProperty('isPortrait');
    expect(result.current).toHaveProperty('isLandscape');
    expect(result.current).toHaveProperty('saveScrollPosition');
    expect(result.current).toHaveProperty('restoreScrollPosition');
    expect(result.current).toHaveProperty('saveFormState');
    expect(result.current).toHaveProperty('restoreFormState');
  });

  it('should preserve scroll position by default', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const { result } = renderHook(() => useOrientationChange());

    // Call saveScrollPosition
    result.current.saveScrollPosition();

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    });

    // Call restoreScrollPosition
    result.current.restoreScrollPosition();

    expect(scrollToSpy).toHaveBeenCalled();
  });

  it('should not preserve scroll position when disabled', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const { result } = renderHook(() =>
      useOrientationChange(undefined, { preserveScrollPosition: false })
    );

    result.current.saveScrollPosition();
    result.current.restoreScrollPosition();

    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('should preserve form state by default', () => {
    const { result } = renderHook(() => useOrientationChange());

    // Create a form element
    const input = document.createElement('input');
    input.name = 'testInput';
    input.value = 'testValue';
    document.body.appendChild(input);

    result.current.saveFormState();
    result.current.restoreFormState();

    expect(input.value).toBe('testValue');

    document.body.removeChild(input);
  });

  it('should not preserve form state when disabled', () => {
    const { result } = renderHook(() =>
      useOrientationChange(undefined, { preserveFormState: false })
    );

    const input = document.createElement('input');
    input.name = 'testInput';
    input.value = 'testValue';
    document.body.appendChild(input);

    result.current.saveFormState();
    input.value = 'changedValue';
    result.current.restoreFormState();

    expect(input.value).toBe('changedValue');

    document.body.removeChild(input);
  });

  it('should save and restore checkbox state', () => {
    const { result } = renderHook(() => useOrientationChange());

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'testCheckbox';
    checkbox.checked = true;
    document.body.appendChild(checkbox);

    result.current.saveFormState();
    checkbox.checked = false;
    result.current.restoreFormState();

    expect(checkbox.checked).toBe(true);

    document.body.removeChild(checkbox);
  });

  it('should save and restore radio button state', () => {
    const { result } = renderHook(() => useOrientationChange());

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'testRadio';
    radio.checked = true;
    document.body.appendChild(radio);

    result.current.saveFormState();
    radio.checked = false;
    result.current.restoreFormState();

    expect(radio.checked).toBe(true);

    document.body.removeChild(radio);
  });

  it('should save and restore textarea state', () => {
    const { result } = renderHook(() => useOrientationChange());

    const textarea = document.createElement('textarea');
    textarea.name = 'testTextarea';
    textarea.value = 'testContent';
    document.body.appendChild(textarea);

    result.current.saveFormState();
    textarea.value = 'changedContent';
    result.current.restoreFormState();

    expect(textarea.value).toBe('testContent');

    document.body.removeChild(textarea);
  });

  it('should save and restore select state', () => {
    const { result } = renderHook(() => useOrientationChange());

    const select = document.createElement('select');
    select.name = 'testSelect';
    const option = document.createElement('option');
    option.value = 'option1';
    select.appendChild(option);
    select.value = 'option1';
    document.body.appendChild(select);

    result.current.saveFormState();
    select.value = '';
    result.current.restoreFormState();

    expect(select.value).toBe('option1');

    document.body.removeChild(select);
  });

  it('should accept custom throttle value', () => {
    const { result } = renderHook(() =>
      useOrientationChange(undefined, { throttleMs: 500 })
    );
    expect(result.current).toBeDefined();
  });

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useOrientationChange(undefined, {
        preserveScrollPosition: true,
        preserveFormState: true,
        throttleMs: 300,
      })
    );
    expect(result.current).toBeDefined();
  });

  it('should maintain state across re-renders', () => {
    const { result, rerender } = renderHook(() => useOrientationChange());
    const initialOrientation = result.current.orientation;

    rerender();

    expect(result.current.orientation).toBe(initialOrientation);
  });

  it('should return consistent values on multiple calls', () => {
    const { result } = renderHook(() => useOrientationChange());
    const firstCall = result.current;
    const secondCall = result.current;

    expect(firstCall.orientation).toBe(secondCall.orientation);
    expect(firstCall.isPortrait).toBe(secondCall.isPortrait);
    expect(firstCall.isLandscape).toBe(secondCall.isLandscape);
  });

  it('should handle multiple hook instances independently', () => {
    const { result: result1 } = renderHook(() => useOrientationChange());
    const { result: result2 } = renderHook(() => useOrientationChange());

    expect(result1.current.orientation).toBe(result2.current.orientation);
  });

  it('should not throw errors on initialization', () => {
    expect(() => {
      renderHook(() => useOrientationChange());
    }).not.toThrow();
  });

  it('should not throw errors with callback', () => {
    const callback = vi.fn();
    expect(() => {
      renderHook(() => useOrientationChange(callback));
    }).not.toThrow();
  });

  it('should not throw errors with various options', () => {
    expect(() => {
      renderHook(() =>
        useOrientationChange(undefined, {
          preserveScrollPosition: true,
          preserveFormState: true,
          throttleMs: 300,
        })
      );
      renderHook(() =>
        useOrientationChange(undefined, {
          preserveScrollPosition: false,
          preserveFormState: false,
          throttleMs: 500,
        })
      );
    }).not.toThrow();
  });

  it('should return boolean for isPortrait', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(typeof result.current.isPortrait).toBe('boolean');
  });

  it('should return boolean for isLandscape', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(typeof result.current.isLandscape).toBe('boolean');
  });

  it('should return number for angle', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(typeof result.current.angle).toBe('number');
  });

  it('should return string for orientation', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(typeof result.current.orientation).toBe('string');
  });

  it('should return functions for state management methods', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(typeof result.current.saveScrollPosition).toBe('function');
    expect(typeof result.current.restoreScrollPosition).toBe('function');
    expect(typeof result.current.saveFormState).toBe('function');
    expect(typeof result.current.restoreFormState).toBe('function');
  });

  it('should handle form elements with id attribute', () => {
    const { result } = renderHook(() => useOrientationChange());

    const input = document.createElement('input');
    input.id = 'testInputId';
    input.value = 'testValue';
    document.body.appendChild(input);

    result.current.saveFormState();
    input.value = 'changedValue';
    result.current.restoreFormState();

    expect(input.value).toBe('testValue');

    document.body.removeChild(input);
  });

  it('should handle multiple form elements', () => {
    const { result } = renderHook(() => useOrientationChange());

    const input1 = document.createElement('input');
    input1.name = 'input1';
    input1.value = 'value1';
    document.body.appendChild(input1);

    const input2 = document.createElement('input');
    input2.name = 'input2';
    input2.value = 'value2';
    document.body.appendChild(input2);

    result.current.saveFormState();
    input1.value = 'changed1';
    input2.value = 'changed2';
    result.current.restoreFormState();

    expect(input1.value).toBe('value1');
    expect(input2.value).toBe('value2');

    document.body.removeChild(input1);
    document.body.removeChild(input2);
  });

  it('should have valid orientation values', () => {
    const { result } = renderHook(() => useOrientationChange());
    expect(['portrait', 'landscape', 'unknown']).toContain(result.current.orientation);
  });

  it('should return state object with correct structure', () => {
    const { result } = renderHook(() => useOrientationChange());
    const state = result.current;
    
    expect(Object.keys(state).sort()).toEqual([
      'angle',
      'isLandscape',
      'isPortrait',
      'orientation',
      'restoreFormState',
      'restoreScrollPosition',
      'saveFormState',
      'saveScrollPosition',
    ].sort());
  });
});
