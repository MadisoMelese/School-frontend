import React from 'react';
import { Card } from '../molecules/Card';
import { Skeleton } from './Skeleton';

export interface SkeletonCardProps {
  /**
   * Number of lines to display
   */
  lines?: number;
  /**
   * Whether to show a header skeleton
   */
  showHeader?: boolean;
  /**
   * Whether to show an avatar skeleton
   */
  showAvatar?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SkeletonCard Component
 * Reusable skeleton loader for card-based content
 * 
 * @example
 * <SkeletonCard lines={3} showHeader showAvatar />
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showHeader = true,
  showAvatar = false,
  className = '',
}) => {
  return (
    <Card className={`${className}`}>
      <div className="space-y-3">
        {showHeader && (
          <div className="flex items-center gap-3">
            {showAvatar && <Skeleton width="40px" height="40px" variant="circular" />}
            <Skeleton width="60%" height="1.25rem" />
          </div>
        )}
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '80%' : 'full'}
            height="1rem"
          />
        ))}
      </div>
    </Card>
  );
};

SkeletonCard.displayName = 'SkeletonCard';
