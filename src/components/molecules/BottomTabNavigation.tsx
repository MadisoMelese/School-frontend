import React, { useEffect, useState } from 'react';
import { Icon } from '../atoms/Icon';

export interface BottomTabItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  roles?: string[];
  badge?: number;
  ariaLabel?: string;
}

export interface BottomTabNavigationProps {
  items: BottomTabItem[];
  activeItem?: string;
  onItemClick: (itemId: string) => void;
  className?: string;
  showLabels?: boolean;
  hideOnScroll?: boolean;
}

/**
 * BottomTabNavigation Component
 *
 * Mobile-optimized bottom tab navigation with:
 * - 44px minimum touch-friendly height
 * - Active state indicator with smooth transitions
 * - Badge support for notifications/unread messages
 * - Responsive icons and labels
 * - Smooth animations
 * - Accessibility features (ARIA labels, keyboard navigation)
 *
 * **Validates: Requirement 17.7 - Bottom tab navigation on mobile**
 */
export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  className = '',
  showLabels = true,
  hideOnScroll = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to hide/show navigation
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      // Show nav when scrolling up or at top
      setIsVisible(!isScrollingDown || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hideOnScroll]);

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    // Support arrow keys for navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = items.findIndex((item) => item.id === itemId);
      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      const nextIndex = (currentIndex + direction + items.length) % items.length;
      handleItemClick(items[nextIndex].id);
    }
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0
        md:hidden
        h-20 bg-white border-t border-neutral-200
        flex items-center justify-around
        z-40
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        ${className}
      `}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const hasNotification = item.badge && item.badge > 0;

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            className={`
              relative
              flex flex-col items-center justify-center
              w-full h-full
              px-2 py-2
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500
              min-h-[64px]
              ${
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900 active:text-primary-600'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.ariaLabel || item.label}
            title={item.label}
          >
            {/* Icon Container with Badge */}
            <div className="relative flex items-center justify-center mb-1">
              <Icon
                name={item.icon as any}
                size={24}
                color="inherit"
                className={`
                  transition-transform duration-200
                  ${isActive ? 'scale-110' : 'scale-100'}
                `}
              />

              {/* Notification Badge */}
              {hasNotification && (
                <div
                  className={`
                    absolute -top-1 -right-1
                    flex items-center justify-center
                    min-w-5 h-5
                    bg-danger-500 text-white
                    rounded-full
                    text-xs font-bold
                    animate-pulse
                  `}
                  role="status"
                  aria-label={`${item.badge || 0} unread`}
                >
                  {(item.badge || 0) > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>

            {/* Label */}
            {showLabels && (
              <span
                className={`
                  text-xs font-medium
                  transition-all duration-200
                  ${isActive ? 'opacity-100' : 'opacity-75'}
                  line-clamp-1
                `}
              >
                {item.label}
              </span>
            )}

            {/* Active Indicator Line */}
            {isActive && (
              <div
                className={`
                  absolute bottom-0 left-1/2 -translate-x-1/2
                  w-8 h-1 bg-primary-600 rounded-t-full
                  animate-in fade-in slide-in-from-bottom-2 duration-200
                `}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
