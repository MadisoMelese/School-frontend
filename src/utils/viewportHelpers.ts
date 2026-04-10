/**
 * Viewport configuration helpers for mobile keyboard handling
 * Manages viewport meta tags and safe area insets
 */

/**
 * Configure viewport meta tag for optimal mobile keyboard handling
 * Should be called once on app initialization
 */
export const configureViewportForMobileKeyboard = () => {
  // Get or create viewport meta tag
  let viewportMeta = document.querySelector('meta[name="viewport"]');

  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }

  // Set optimal viewport configuration
  // - width=device-width: Responsive design
  // - initial-scale=1: No zoom on load
  // - viewport-fit=cover: Support notch/safe areas
  // - interactive-widget=resizes-content: Keyboard resizes content (iOS 15+)
  viewportMeta.setAttribute(
    'content',
    'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content'
  );
};

/**
 * Get safe area insets (notch, home indicator, etc.)
 * Returns CSS env() values for safe-area-inset-*
 */
export const getSafeAreaInsets = () => {
  return {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
  };
};

/**
 * Prevent layout shift when keyboard appears
 * Adds padding to body to accommodate keyboard
 */
export const preventLayoutShiftOnKeyboard = (keyboardHeight: number) => {
  if (keyboardHeight > 0) {
    document.body.style.paddingBottom = `${keyboardHeight}px`;
  } else {
    document.body.style.paddingBottom = '0';
  }
};

/**
 * Get keyboard height from visual viewport
 * More accurate than window.innerHeight on iOS
 */
export const getKeyboardHeightFromVisualViewport = (): number => {
  if (!window.visualViewport) {
    return 0;
  }

  const visualHeight = window.visualViewport.height;
  const screenHeight = window.screen.height;

  return Math.max(0, screenHeight - visualHeight);
};

/**
 * Check if device is in landscape mode
 */
export const isLandscapeMode = (): boolean => {
  return window.innerWidth > window.innerHeight;
};

/**
 * Check if device is in portrait mode
 */
export const isPortraitMode = (): boolean => {
  return window.innerHeight > window.innerWidth;
};

/**
 * Get available viewport height (accounting for keyboard)
 */
export const getAvailableViewportHeight = (): number => {
  const keyboardHeight = getKeyboardHeightFromVisualViewport();
  return window.innerHeight - keyboardHeight;
};

/**
 * Disable zoom on input focus (prevents iOS zoom)
 * Call this to prevent automatic zoom when focusing inputs
 */
export const disableInputZoom = () => {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    const content = viewportMeta.getAttribute('content') || '';
    if (!content.includes('user-scalable=no')) {
      viewportMeta.setAttribute('content', content + ', user-scalable=no, maximum-scale=1');
    }
  }
};

/**
 * Enable zoom on input focus (allows user zoom)
 * Call this to allow user zoom after disabling it
 */
export const enableInputZoom = () => {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    let content = viewportMeta.getAttribute('content') || '';
    content = content.replace(', user-scalable=no', '');
    content = content.replace(', maximum-scale=1', '');
    viewportMeta.setAttribute('content', content);
  }
};
