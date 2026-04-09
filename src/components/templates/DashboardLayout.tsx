import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useUIStore } from '@store/uiStore';
import { useAuth } from '@hooks/useAuth';
import { Header } from '@components/organisms/Header';
import { Navigation, NavItem } from '@components/organisms/Navigation';

/**
 * DashboardLayout Component
 * Main app layout with navigation and content area
 * Features:
 * - Responsive sidebar (desktop) / bottom nav (mobile)
 * - Header with user menu and notifications
 * - Scrollable content area
 * - Theme support
 * - Accessibility compliant
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, logout } = useAuth();
  const [hideNavOnScroll, setHideNavOnScroll] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Default navigation items
  const defaultNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
    { id: 'grades', label: 'Grades', icon: 'BookOpen', href: '/grades' },
    { id: 'attendance', label: 'Attendance', icon: 'Calendar', href: '/attendance' },
    { id: 'messages', label: 'Messages', icon: 'Mail', href: '/messages' },
  ];

  // Handle scroll to hide/show bottom nav on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      setHideNavOnScroll(isScrollingDown && currentScrollY > 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  const handleNavItemClick = (itemId: string) => {
    // Navigate to the item's href
    const item = defaultNavItems.find(i => i.id === itemId);
    if (item) {
      window.location.href = item.href;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      {!isMobile && (
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 overflow-y-auto scrollbar-thin`}
          role="navigation"
          aria-label="Main navigation"
        >
          <Navigation
            items={defaultNavItems}
            onItemClick={handleNavItemClick}
            user={user || undefined}
            onLogout={logout}
          />
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40"
          role="banner"
        >
          <Header
            title={title}
            user={user || undefined}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            onLogout={logout}
          />
        </header>

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto scrollbar-thin"
          role="main"
          aria-label="Main content"
        >
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
            {/* Page title and description */}
            {title && (
              <div className="mb-6 sm:mb-8 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Page content */}
            {children}
          </div>

          {/* Safe area for mobile */}
          <div className="h-20 md:h-0" aria-hidden="true" />
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      {isMobile && (
        <nav
          className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 transition-transform duration-300 ${
            hideNavOnScroll ? 'translate-y-full' : 'translate-y-0'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <Navigation
            items={defaultNavItems}
            onItemClick={handleNavItemClick}
            user={user || undefined}
            onLogout={logout}
          />
        </nav>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && sidebarOpen && (
        <aside
          className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 z-40 overflow-y-auto scrollbar-thin animate-slide-right"
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <Navigation
            items={defaultNavItems}
            onItemClick={handleNavItemClick}
            user={user || undefined}
            onLogout={logout}
          />
        </aside>
      )}
    </div>
  );
};

export default DashboardLayout;
