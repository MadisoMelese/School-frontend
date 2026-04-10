import React from 'react';
import { Card } from '../molecules/Card';
import { Spinner } from '../atoms/Spinner';

export interface Widget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'list' | 'card';
  content: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  error?: string;
}

export interface DashboardProps {
  widgets: Widget[];
  loading?: boolean;
  error?: string;
}

const getSizeClasses = (size?: string): string => {
  switch (size) {
    case 'large':
      // Large widgets span 2 columns on tablet/desktop
      return 'col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2';
    case 'medium':
      // Medium widgets span 1 column
      return 'col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1';
    case 'small':
    default:
      // Small widgets span 1 column
      return 'col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1';
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ widgets, loading = false, error }) => {
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-danger-600 font-medium">{error}</p>
      </div>
    );
  }

  if (widgets.length === 0 && !loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-500">No widgets available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Grid - Responsive from 1 column (mobile) to 3+ columns (desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 auto-rows-max">
        {loading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-5 md:p-6 h-48"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse" />
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))
          : widgets.map((widget) => (
              <div
                key={widget.id}
                className={`${getSizeClasses(widget.size)}`}
                role="region"
                aria-label={widget.title}
              >
                <Card header={widget.title} className={widget.loading ? 'opacity-75' : ''}>
                  {widget.loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="md" />
                    </div>
                  ) : widget.error ? (
                    <div className="p-4 text-center">
                      <p className="text-danger-600 text-sm">{widget.error}</p>
                    </div>
                  ) : (
                    widget.content
                  )}
                </Card>
              </div>
            ))}
      </div>
    </div>
  );
};
