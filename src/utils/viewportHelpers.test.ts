import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  configureViewportForMobileKeyboard,
  getSafeAreaInsets,
  preventLayoutShiftOnKeyboard,
  getKeyboardHeightFromVisualViewport,
  isLandscapeMode,
  isPortraitMode,
  getAvailableViewportHeight,
  disableInputZoom,
  enableInputZoom,
} from './viewportHelpers';

describe('viewportHelpers', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let originalScreenHeight: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalScreenHeight = window.screen.height;

    // Clear viewport meta tag
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.remove();
    }
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: originalInnerHeight,
    });
    Object.defineProperty(window, 'screen', {
      writable: true,
      value: { height: originalScreenHeight },
    });

    // Restore body padding
    document.body.style.paddingBottom = '';
  });

  describe('configureViewportForMobileKeyboard', () => {
    it('should create viewport meta tag if not exists', () => {
      configureViewportForMobileKeyboard();

      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toBeInTheDocument();
    });

    it('should set correct viewport content', () => {
      configureViewportForMobileKeyboard();

      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const content = viewportMeta?.getAttribute('content');

      expect(content).toContain('width=device-width');
      expect(content).toContain('initial-scale=1');
      expect(content).toContain('viewport-fit=cover');
      expect(content).toContain('interactive-widget=resizes-content');
    });

    it('should update existing viewport meta tag', () => {
      const existingMeta = document.createElement('meta');
      existingMeta.setAttribute('name', 'viewport');
      existingMeta.setAttribute('content', 'width=device-width');
      document.head.appendChild(existingMeta);

      configureViewportForMobileKeyboard();

      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const content = viewportMeta?.getAttribute('content');

      expect(content).toContain('interactive-widget=resizes-content');
    });
  });

  describe('getSafeAreaInsets', () => {
    it('should return safe area inset values', () => {
      const insets = getSafeAreaInsets();

      expect(insets.top).toBe('env(safe-area-inset-top)');
      expect(insets.right).toBe('env(safe-area-inset-right)');
      expect(insets.bottom).toBe('env(safe-area-inset-bottom)');
      expect(insets.left).toBe('env(safe-area-inset-left)');
    });
  });

  describe('preventLayoutShiftOnKeyboard', () => {
    it('should add padding to body when keyboard height is positive', () => {
      preventLayoutShiftOnKeyboard(300);

      expect(document.body.style.paddingBottom).toBe('300px');
    });

    it('should remove padding when keyboard height is 0', () => {
      preventLayoutShiftOnKeyboard(300);
      preventLayoutShiftOnKeyboard(0);

      expect(document.body.style.paddingBottom).toBe('0');
    });

    it('should handle different keyboard heights', () => {
      preventLayoutShiftOnKeyboard(250);
      expect(document.body.style.paddingBottom).toBe('250px');

      preventLayoutShiftOnKeyboard(350);
      expect(document.body.style.paddingBottom).toBe('350px');
    });
  });

  describe('getKeyboardHeightFromVisualViewport', () => {
    it('should return 0 when visualViewport is not available', () => {
      const originalVisualViewport = window.visualViewport;
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        value: null,
      });

      const height = getKeyboardHeightFromVisualViewport();

      expect(height).toBe(0);

      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        value: originalVisualViewport,
      });
    });

    it('should calculate keyboard height from visual viewport', () => {
      if (window.visualViewport) {
        const screenHeight = 800;
        const visualHeight = 500;
        const expectedKeyboardHeight = screenHeight - visualHeight;

        Object.defineProperty(window.visualViewport, 'height', {
          writable: true,
          value: visualHeight,
        });
        Object.defineProperty(window, 'screen', {
          writable: true,
          value: { height: screenHeight },
        });

        const height = getKeyboardHeightFromVisualViewport();

        expect(height).toBe(expectedKeyboardHeight);
      }
    });
  });

  describe('isLandscapeMode', () => {
    it('should return true when width > height', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 768,
      });

      expect(isLandscapeMode()).toBe(true);
    });

    it('should return false when width <= height', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 1024,
      });

      expect(isLandscapeMode()).toBe(false);
    });
  });

  describe('isPortraitMode', () => {
    it('should return true when height > width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 1024,
      });

      expect(isPortraitMode()).toBe(true);
    });

    it('should return false when height <= width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 768,
      });

      expect(isPortraitMode()).toBe(false);
    });
  });

  describe('getAvailableViewportHeight', () => {
    it('should return viewport height minus keyboard height', () => {
      if (window.visualViewport) {
        const screenHeight = 800;
        const visualHeight = 500;
        const expectedAvailableHeight = visualHeight;

        Object.defineProperty(window.visualViewport, 'height', {
          writable: true,
          value: visualHeight,
        });
        Object.defineProperty(window, 'screen', {
          writable: true,
          value: { height: screenHeight },
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          value: screenHeight,
        });

        const availableHeight = getAvailableViewportHeight();

        expect(availableHeight).toBe(expectedAvailableHeight);
      }
    });
  });

  describe('disableInputZoom', () => {
    it('should add user-scalable=no to viewport meta tag', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width');
      document.head.appendChild(meta);

      disableInputZoom();

      const content = meta.getAttribute('content');
      expect(content).toContain('user-scalable=no');
      expect(content).toContain('maximum-scale=1');
    });

    it('should not add duplicate user-scalable=no', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, user-scalable=no');
      document.head.appendChild(meta);

      disableInputZoom();

      const content = meta.getAttribute('content');
      const count = (content?.match(/user-scalable=no/g) || []).length;
      expect(count).toBe(1);
    });
  });

  describe('enableInputZoom', () => {
    it('should remove user-scalable=no from viewport meta tag', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, user-scalable=no, maximum-scale=1');
      document.head.appendChild(meta);

      enableInputZoom();

      const content = meta.getAttribute('content');
      expect(content).not.toContain('user-scalable=no');
      expect(content).not.toContain('maximum-scale=1');
    });

    it('should handle missing viewport meta tag', () => {
      // Should not throw error
      expect(() => enableInputZoom()).not.toThrow();
    });
  });
});
