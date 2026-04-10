import React from 'react';
import { useTheme } from '@hooks/useTheme';

/**
 * AuthLayout Component
 * Layout for authentication pages (login, password reset, etc.)
 * Features:
 * - Centered card layout
 * - Responsive design (mobile-first)
 * - Theme support (light/dark mode)
 * - Accessibility compliant
 */

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBranding?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBranding = true,
}) => {
  useTheme();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 px-4 py-8 sm:px-6 lg:px-8"
      role="main"
      aria-label="Authentication page"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 dark:bg-primary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200 dark:bg-secondary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" />
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Branding section */}
        {showBranding && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg"
                aria-label="SchoolOS logo"
              >
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              SchoolOS
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              School Management System
            </p>
          </div>
        )}

        {/* Auth card */}
        <div
          className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-scale-in"
          role="region"
          aria-label="Authentication form"
        >
          {/* Title and subtitle */}
          {title && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">{subtitle}</p>
              )}
            </div>
          )}

          {/* Form content */}
          <div className="space-y-4">{children}</div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>Protected by industry-standard security and encryption</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
