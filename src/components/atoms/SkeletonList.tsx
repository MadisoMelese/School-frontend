import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonListProps {
  /**
   * Number of list items to display
   */
  items?: number;
  /**
   * Whether to show avatar in each item
   */
  showAvatar?: boolean;
  /**
   * Whether to show secondary text
   */
  showSecondary?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkeletonList Component
 * Reusable skeleton loader for list-based content
 * 
 * @example
 * <SkeletonList items={5} showAvatar showSecondary />
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = false,
  showSecondary = true,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
        >
          {showAvatar && (
            <Skeleton width="40px" height="40px" variant="circular" className="flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height="1rem" />
            {showSecondary && <Skeleton width="50%" height="0.875rem" />}
          </div>
        </div>
      ))}
    </div>
  );
};

SkeletonList.displayName = 'SkeletonList';
