import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
  warning: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
  danger: 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200',
  info: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
  neutral: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className,
}) => {
  const baseStyles = 'inline-flex items-center gap-1 font-medium rounded-full';

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      role="status"
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
