import React from 'react';
import { SkeletonCard } from './SkeletonCard';

export interface SkeletonDashboardProps {
  /**
   * Number of widget skeletons to display
   */
  widgets?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkeletonDashboard Component
 * Reusable skeleton loader for dashboard widgets
 * 
 * @example
 * <SkeletonDashboard widgets={6} />
 */
export const SkeletonDashboard: React.FC<SkeletonDashboardProps> = ({
  widgets = 4,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 ${className}`}>
      {Array.from({ length: widgets }).map((_, index) => (
        <SkeletonCard key={index} lines={3} showHeader />
      ))}
    </div>
  );
};

SkeletonDashboard.displayName = 'SkeletonDashboard';
