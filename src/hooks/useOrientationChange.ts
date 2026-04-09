import { useEffect, useRef, useCallback } from 'react';
import { useDeviceOrientation, type Orientation } from './useDeviceOrientation';

/**
 * Orientation change callback
 */
export type OrientationChangeCallback = (orientation: Orientation, angle: number) => void;

/**
 * useOrientationChange Hook
 * Handles layout adjustments when device rotates
 * Preserves scroll position and form state during rotation
 */
export const useOrientationChange = (
  onOrientationChange?: OrientationChangeCallback,
  options: {
    preserveScrollPosition?: boolean;
    preserveFormState?: boolean;
    throttleMs?: number;
  } = {}
) => {
  const {
    preserveScrollPosition = true,
    preserveFormState = true,
    throttleMs = 300,
  } = options;

  const orientationState = useDeviceOrientation(throttleMs);
  const previousOrientationRef = useRef<Orientation>(orientationState.orientation);
  const scrollPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const formStateRef = useRef<Record<string, any>>({});

  // Save scroll position before orientation change
  const saveScrollPosition = useCallback(() => {
    if (preserveScrollPosition && typeof window !== 'undefined') {
      scrollPositionRef.current = {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset,
      };
    }
  }, [preserveScrollPosition]);

  // Restore scroll position after orientation change
  const restoreScrollPosition = useCallback(() => {
    if (preserveScrollPosition && typeof window !== 'undefined') {
      const { x, y } = scrollPositionRef.current;
      window.scrollTo(x, y);
    }
  }, [preserveScrollPosition]);

  // Save form state before orientation change
  const saveFormState = useCallback(() => {
    if (preserveFormState && typeof document !== 'undefined') {
      const formElements = document.querySelectorAll('input, textarea, select');
      formElements.forEach((element: Element) => {
        const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const key = input.name || input.id;
        if (key) {
          if (input.type === 'checkbox' || input.type === 'radio') {
            formStateRef.current[key] = (input as HTMLInputElement).checked;
          } else {
            formStateRef.current[key] = input.value;
          }
        }
      });
    }
  }, [preserveFormState]);

  // Restore form state after orientation change
  const restoreFormState = useCallback(() => {
    if (preserveFormState && typeof document !== 'undefined') {
      Object.entries(formStateRef.current).forEach(([key, value]) => {
        const element = document.querySelector(
          `input[name="${key}"], input[id="${key}"], textarea[name="${key}"], textarea[id="${key}"], select[name="${key}"], select[id="${key}"]`
        ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;

        if (element) {
          if (element.type === 'checkbox' || element.type === 'radio') {
            (element as HTMLInputElement).checked = value;
          } else {
            element.value = value;
          }
        }
      });
    }
  }, [preserveFormState]);

  // Handle orientation change
  useEffect(() => {
    const currentOrientation = orientationState.orientation;

    if (currentOrientation !== previousOrientationRef.current) {
      // Save state before orientation change
      saveScrollPosition();
      saveFormState();

      // Trigger callback
      if (onOrientationChange) {
        onOrientationChange(currentOrientation, orientationState.angle);
      }

      // Restore state after orientation change
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        restoreScrollPosition();
        restoreFormState();
      });

      previousOrientationRef.current = currentOrientation;
    }
  }, [
    orientationState.orientation,
    orientationState.angle,
    onOrientationChange,
    saveScrollPosition,
    saveFormState,
    restoreScrollPosition,
    restoreFormState,
  ]);

  return {
    orientation: orientationState.orientation,
    angle: orientationState.angle,
    isPortrait: orientationState.isPortrait,
    isLandscape: orientationState.isLandscape,
    saveScrollPosition,
    restoreScrollPosition,
    saveFormState,
    restoreFormState,
  };
};

export default useOrientationChange;
