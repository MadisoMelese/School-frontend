import React, { useState } from 'react';
import type { User } from '../../types';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { BottomTabNavigation } from './BottomTabNavigation';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  roles?: string[];
  badge?: number;
}

export interface NavigationProps {
  items: NavItem[];
  activeItem?: string;
  onItemClick: (itemId: string) => void;
  user?: User;
  onLogout: () => void;
  useBottomTabNavigation?: boolean;
  enableScrollHiding?: boolean;
  scrollHideThreshold?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  user,
  onLogout,
  useBottomTabNavigation = true,
  enableScrollHiding = true,
  scrollHideThreshold = 50,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavClick = (itemId: string) => {
    onItemClick(itemId);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4 z-40">
        <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">SchoolOS</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
          aria-label="Toggle navigation"
          aria-expanded={sidebarOpen}
        >
          <Icon name={sidebarOpen ? 'X' : 'Menu'} size={24} />
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col transition-transform duration-300 z-50 md:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo - Desktop Only */}
        <div className="hidden md:flex items-center gap-2 px-4 py-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-white">SchoolOS</h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 mt-16 md:mt-0">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeItem === item.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              aria-current={activeItem === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon as keyof typeof import('lucide-react')} size={20} />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <Badge variant="danger" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                aria-expanded={userMenuOpen}
                aria-label="User menu"
              >
                <Avatar name={`${user.firstname} ${user.lastname}`} src={user.avatar} size="md" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {user.firstname} {user.lastname}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                    {user.role}
                  </p>
                </div>
                <Icon
                  name={userMenuOpen ? 'ChevronUp' : 'ChevronDown'}
                  size={16}
                  className="text-neutral-400 dark:text-neutral-500"
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors flex items-center gap-2"
                  >
                    <Icon name="LogOut" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation - Conditionally rendered */}
      {useBottomTabNavigation && (
        <div className="md:hidden">
          <BottomTabNavigation
            items={items}
            activeItem={activeItem}
            onItemClick={handleNavClick}
            userRole={user?.role}
            enableScrollHiding={enableScrollHiding}
            scrollHideThreshold={scrollHideThreshold}
          />
        </div>
      )}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
