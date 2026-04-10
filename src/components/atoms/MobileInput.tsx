import React, { useRef, useEffect, forwardRef } from 'react';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  onKeyboardDismiss?: () => void;
  autoFocusOnMount?: boolean;
  scrollIntoViewOnFocus?: boolean;
}

/**
 * Mobile-optimized input component with keyboard handling
 * Features:
 * - Proper keyboard type selection (email, number, tel, date, etc.)
 * - Auto-focus support
 * - Scroll into view on focus
 * - Keyboard dismissal callback
 * - Touch-friendly tap targets (44px minimum)
 * - Proper ARIA labels
 */
export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  (
    {
      error,
      label,
      helperText,
      id,
      className,
      disabled,
      type = 'text',
      onKeyboardDismiss,
      autoFocusOnMount = false,
      scrollIntoViewOnFocus = true,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    // Auto-focus on mount
    useEffect(() => {
      if (autoFocusOnMount && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocusOnMount]);

    // Handle focus to scroll into view
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (scrollIntoViewOnFocus) {
        requestAnimationFrame(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      props.onFocus?.(e);
    };

    // Handle blur to dismiss keyboard
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onKeyboardDismiss?.();
      props.onBlur?.(e);
    };

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Escape key to dismiss keyboard
      if (e.key === 'Escape') {
        e.currentTarget.blur();
        onKeyboardDismiss?.();
      }

      // Enter key handling
      if (e.key === 'Enter') {
        // For email, number, tel, date inputs, dismiss keyboard on Enter
        if (['email', 'number', 'tel', 'date', 'time'].includes(type)) {
          e.currentTarget.blur();
          onKeyboardDismiss?.();
        }
      }

      props.onKeyDown?.(e);
    };

    const baseStyles =
      'w-full px-3 py-2.5 text-base rounded-lg border-2 transition-colors duration-200 focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed min-h-[44px]';

    const borderStyle = error
      ? 'border-danger-500 focus:border-danger-600 focus:ring-2 focus:ring-danger-200'
      : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref || inputRef}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`${baseStyles} ${borderStyle} ${className || ''}`}
          aria-describedby={errorId || helperId}
          aria-invalid={!!error}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-danger-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';
