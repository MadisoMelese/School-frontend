import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const positionStyles = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
};

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-neutral-700 border-l-transparent border-r-transparent border-b-transparent',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-700 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-neutral-700 border-t-transparent border-b-transparent border-r-transparent',
  right:
    'right-full top-1/2 -translate-y-1/2 border-r-neutral-700 border-t-transparent border-b-transparent border-l-transparent',
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div aria-describedby={isVisible ? tooltipId.current : undefined}>{children}</div>

      {isVisible && (
        <div
          id={tooltipId.current}
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-neutral-700 rounded-lg whitespace-nowrap animate-fade-in ${positionStyles[position]} ${className || ''}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};
