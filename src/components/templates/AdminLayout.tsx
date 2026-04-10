import React, { useState } from 'react';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { Header } from '@components/organisms/Header';
import { Menu, X } from 'lucide-react';

/**
 * AdminLayout Component
 * Layout for admin-specific pages with sidebar navigation
 * Features:
 * - Collapsible sidebar with admin menu
 * - Header with admin controls
 * - Responsive design (sidebar collapses on mobile)
 * - Theme support
 * - Accessibility compliant
 */

interface AdminMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  submenu?: AdminMenuItem[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  menuItems?: AdminMenuItem[];
  currentPath?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  description,
  menuItems = [],
  currentPath = '',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleSubmenu = (label: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedMenus(newExpanded);
  };

  const renderMenuItem = (item: AdminMenuItem, depth = 0) => {
    const isActive = currentPath === item.href;
    const isExpanded = expandedMenus.has(item.label);
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div key={item.label}>
        <a
          href={item.href}
          onClick={(e) => {
            if (hasSubmenu) {
              e.preventDefault();
              toggleSubmenu(item.label);
            }
          }}
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
          role="menuitem"
          aria-current={isActive ? 'page' : undefined}
        >
          <div className="flex items-center gap-3">
            {item.icon && <span className="w-5 h-5">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className="bg-danger-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {item.badge}
              </span>
            )}
            {hasSubmenu && (
              <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
            )}
          </div>
        </a>

        {/* Submenu */}
        {hasSubmenu && isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-neutral-200 dark:border-neutral-700">
            {item.submenu!.map((subitem) => renderMenuItem(subitem, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 overflow-hidden md:w-64 md:overflow-y-auto scrollbar-thin`}
        role="navigation"
        aria-label="Admin navigation"
        aria-hidden={!sidebarOpen && isMobile}
      >
        {/* Sidebar header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Admin Panel</h2>
        </div>

        {/* Menu items */}
        <nav className="p-4 space-y-1" role="menu">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40"
          role="banner"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Header content */}
            <div className="flex-1 ml-4 md:ml-0">
              <Header title={title} />
            </div>
          </div>
        </header>

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto scrollbar-thin"
          role="main"
          aria-label="Admin content"
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

            {/* Admin content */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AdminLayout;
