import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Orientation type
 */
export type Orientation = 'portrait' | 'landscape' | 'unknown';

/**
 * Device orientation state
 */
export interface DeviceOrientationState {
  orientation: Orientation;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * useDeviceOrientation Hook
 * Detects device orientation changes (portrait/landscape)
 * Uses throttling to prevent excessive re-renders
 */
export const useDeviceOrientation = (throttleMs: number = 300): DeviceOrientationState => {
  const [state, setState] = useState<DeviceOrientationState>(() => {
    const orientation = getOrientation();
    return {
      orientation,
      angle: getOrientationAngle(),
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
    };
  });

  const lastUpdateTimeRef = useRef(Date.now());

  const handleOrientationChange = useCallback(() => {
    const now = Date.now();

    // Throttle orientation change events
    if (now - lastUpdateTimeRef.current < throttleMs) {
      return;
    }

    lastUpdateTimeRef.current = now;

    const orientation = getOrientation();
    const angle = getOrientationAngle();

    setState({
      orientation,
      angle,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
    });
  }, [throttleMs]);

  useEffect(() => {
    // Listen for orientation change events
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [handleOrientationChange]);

  return state;
};

/**
 * Helper function to determine current orientation
 */
function getOrientation(): Orientation {
  // Check screen.orientation API (modern browsers)
  if (typeof window !== 'undefined' && window.screen?.orientation) {
    const type = window.screen.orientation.type;
    if (type.includes('portrait')) return 'portrait';
    if (type.includes('landscape')) return 'landscape';
  }

  // Fallback to window dimensions
  if (typeof window !== 'undefined') {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  return 'unknown';
}

/**
 * Helper function to get orientation angle
 */
function getOrientationAngle(): number {
  if (typeof window !== 'undefined' && window.screen?.orientation) {
    return window.screen.orientation.angle || 0;
  }

  if (typeof window !== 'undefined' && 'orientation' in window) {
    return (window as any).orientation || 0;
  }

  return 0;
}

export default useDeviceOrientation;
