import React from 'react';
import { Card } from '../molecules/Card';
import { Spinner } from '../atoms/Spinner';
import { SkeletonDashboard } from '../atoms/SkeletonDashboard';

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
        {loading ? (
          <SkeletonDashboard widgets={4} />
        ) : (
          widgets.map((widget) => (
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
          ))
        )}
      </div>
    </div>
  );
};
