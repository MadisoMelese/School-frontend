import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-14 h-14 text-xl',
};

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name?: string): string => {
  if (!name) return 'bg-neutral-300';

  const colors = [
    'bg-primary-300',
    'bg-secondary-300',
    'bg-success-300',
    'bg-warning-300',
    'bg-danger-300',
  ];

  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[hash % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = 'md', className }) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold';

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`${baseStyles} ${sizeStyles[size]} object-cover ${className || ''}`}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${bgColor} text-white ${className || ''}`}
      role="img"
      aria-label={name || 'Avatar'}
    >
      {initials}
    </div>
  );
};
