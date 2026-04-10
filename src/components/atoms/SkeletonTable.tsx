import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonTableProps {
  /**
   * Number of rows to display
   */
  rows?: number;
  /**
   * Number of columns to display
   */
  columns?: number;
  /**
   * Whether to show table header
   */
  showHeader?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkeletonTable Component
 * Reusable skeleton loader for table-based content
 * 
 * @example
 * <SkeletonTable rows={5} columns={4} showHeader />
 */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        {showHeader && (
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <Skeleton width="80%" height="1rem" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton width="90%" height="1rem" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

SkeletonTable.displayName = 'SkeletonTable';
