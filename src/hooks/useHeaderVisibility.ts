import { useEffect, useState } from 'react';
import { useScrollDirection } from './useScrollDirection';
import { useMediaQuery } from './useMediaQuery';

/**
 * useHeaderVisibility Hook
 * Manages header visibility state based on scroll direction
 * Only applies to mobile devices (below lg breakpoint)
 *
 * @param scrollThreshold - Minimum pixels scrolled before hiding header (default: 50)
 * @returns Object with isHeaderVisible boolean and scrollDirection
 */
export const useHeaderVisibility = (scrollThreshold: number = 50) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollDirection, setLastScrollDirection] = useState<'up' | 'down'>('up');
  const { scrollDirection, scrollY } = useScrollDirection(scrollThreshold);
  const isMobile = useMediaQuery('(max-width: 1024px)'); // Below lg breakpoint

  useEffect(() => {
    // Only apply header hiding on mobile devices
    if (!isMobile) {
      setIsHeaderVisible(true);
      return;
    }

    // Show header when scrolling up
    if (scrollDirection === 'up' && lastScrollDirection === 'down') {
      setIsHeaderVisible(true);
    }
    // Hide header when scrolling down (but keep visible at top)
    else if (scrollDirection === 'down' && scrollY > scrollThreshold) {
      setIsHeaderVisible(false);
    }
    // Always show header at the top of the page
    else if (scrollY <= scrollThreshold) {
      setIsHeaderVisible(true);
    }

    setLastScrollDirection(scrollDirection);
  }, [scrollDirection, scrollY, isMobile, scrollThreshold, lastScrollDirection]);

  return {
    isHeaderVisible,
    scrollDirection,
    scrollY,
    isMobile,
  };
};

export default useHeaderVisibility;
