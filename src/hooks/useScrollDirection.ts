import { useEffect, useState, useRef } from 'react';

/**
 * useScrollDirection Hook
 * Detects scroll direction (up/down) with configurable threshold
 *
 * @param threshold - Minimum pixels scrolled before direction change is detected (default: 50)
 * @returns Object with scrollDirection ('up' | 'down') and scrollY position
 */
export const useScrollDirection = (threshold: number = 50) => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [scrollY, setScrollY] = useState(0);
  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Determine scroll direction based on threshold
      const diff = currentScrollY - lastScrollYRef.current;

      if (Math.abs(diff) >= threshold) {
        if (diff > 0) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
        lastScrollYRef.current = currentScrollY;
      }
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [threshold]);

  return { scrollDirection, scrollY };
};

export default useScrollDirection;
