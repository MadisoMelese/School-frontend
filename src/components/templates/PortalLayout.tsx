import React from 'react';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { Header } from '@components/organisms/Header';
import { Breadcrumb } from '@components/molecules/Breadcrumb';

/**
 * PortalLayout Component
 * Layout for feature-specific portals (Student Portal, Teacher Portal, etc.)
 * Features:
 * - Breadcrumb navigation
 * - Sidebar for portal-specific navigation
 * - Responsive design
 * - Theme support
 * - Accessibility compliant
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  sidebarContent?: React.ReactNode;
  showSidebar?: boolean;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  title,
  description,
  breadcrumbs,
  sidebarContent,
  showSidebar = true,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header
        className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40"
        role="banner"
      >
        <Header title={title} />
      </header>

      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Main content area */}
      <div className="flex">
        {/* Sidebar (Desktop/Tablet) */}
        {showSidebar && sidebarContent && !isMobile && (
          <aside
            className="w-64 lg:w-72 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto scrollbar-thin"
            role="complementary"
            aria-label="Portal navigation"
          >
            <div className="p-4 sm:p-6">{sidebarContent}</div>
          </aside>
        )}

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto scrollbar-thin"
          role="main"
          aria-label="Portal content"
        >
          <div className="container-responsive py-6 sm:py-8">
            {/* Page title and description */}
            {title && (
              <div className="mb-6 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  {title}
                </h1>
                {description && (
                  <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
                )}
              </div>
            )}

            {/* Portal content */}
            <div className="grid grid-cols-1 gap-6">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar (if needed) */}
      {isMobile && showSidebar && sidebarContent && (
        <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer font-medium text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
              <span>Portal Navigation</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-4 space-y-2">{sidebarContent}</div>
          </details>
        </div>
      )}
    </div>
  );
};

export default PortalLayout;
