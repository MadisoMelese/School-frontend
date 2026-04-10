import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb Component
 * Navigation breadcrumb for showing page hierarchy
 * Features:
 * - Responsive design
 * - Keyboard navigation
 * - ARIA labels for accessibility
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 text-neutral-400 dark:text-neutral-600"
                aria-hidden="true"
              />
            )}
            {item.href ? (
              <a
                href={item.href}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span
                className="text-neutral-600 dark:text-neutral-400"
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
