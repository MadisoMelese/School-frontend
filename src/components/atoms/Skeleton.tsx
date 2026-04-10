import React from 'react';

export interface SkeletonProps {
  /**
   * Width of the skeleton (CSS value or 'full')
   */
  width?: string | 'full';
  /**
   * Height of the skeleton (CSS value)
   */
  height?: string;
  /**
   * Shape of the skeleton
   */
  variant?: 'text' | 'circular' | 'rectangular';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Animation type
   */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Component
 * Base skeleton loader component for creating loading placeholders
 * 
 * @example
 * <Skeleton width="200px" height="20px" variant="text" />
 * <Skeleton width="40px" height="40px" variant="circular" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'full',
  height = '1rem',
  variant = 'rectangular',
  className = '',
  animation = 'pulse',
}) => {
  const widthClass = width === 'full' ? 'w-full' : '';
  const widthStyle = width !== 'full' ? { width } : {};
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={`bg-neutral-200 dark:bg-neutral-700 ${variantClasses[variant]} ${animationClasses[animation]} ${widthClass} ${className}`}
      style={{ height, ...widthStyle }}
      role="status"
      aria-label="Loading..."
    />
  );
};

Skeleton.displayName = 'Skeleton';
