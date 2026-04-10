import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, helperText, id, className, disabled, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const baseStyles =
      'w-full px-3 py-2.5 text-base rounded-lg border-2 transition-colors duration-200 focus:outline-none disabled:bg-neutral-100 dark:disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed min-h-[44px] bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400';

    const borderStyle = error
      ? 'border-danger-500 dark:border-danger-600 focus:border-danger-600 dark:focus:border-danger-500 focus:ring-2 focus:ring-danger-200 dark:focus:ring-danger-900'
      : 'border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900';

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`${baseStyles} ${borderStyle} ${className || ''}`}
          aria-describedby={errorId || helperId}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
