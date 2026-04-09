/**
 * Error Reporter Service
 * Captures and reports errors to Sentry for monitoring and debugging
 */

export interface ErrorContext {
  userId?: string;
  userName?: string;
  page?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Initialize error reporter (Sentry)
 * Note: Sentry initialization would happen in main.tsx
 */
export const initializeErrorReporter = (): void => {
  // Sentry would be initialized here with environment-specific config
  // Example:
  // import * as Sentry from "@sentry/react";
  // Sentry.init({
  //   dsn: (import.meta.env as any).VITE_SENTRY_DSN,
  //   environment: (import.meta.env as any).VITE_ENVIRONMENT,
  //   tracesSampleRate: 1.0,
  // });
};

/**
 * Capture exception with context
 */
export const captureException = (error: Error | unknown, context?: ErrorContext): void => {
  try {
    // Log to console in development
    if ((import.meta.env as any).DEV) {
      console.error('Error captured:', error, context);
    }

    // Send to Sentry in production
    if ((import.meta.env as any).PROD) {
      // Sentry.captureException(error, { contexts: { custom: context } });
    }
  } catch (err) {
    console.error('Error reporting failed:', err);
  }
};

/**
 * Capture message for debugging
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info'): void => {
  try {
    if ((import.meta.env as any).DEV) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }

    if ((import.meta.env as any).PROD) {
      // Sentry.captureMessage(message, level);
    }
  } catch (err) {
    console.error('Message reporting failed:', err);
  }
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, userName: string, email?: string): void => {
  try {
    if ((import.meta.env as any).PROD) {
      // Sentry.setUser({
      //   id: userId,
      //   username: userName,
      //   email: email,
      // });
    }
  } catch (err) {
    console.error('Setting user context failed:', err);
  }
};

/**
 * Clear user context
 */
export const clearUserContext = (): void => {
  try {
    if ((import.meta.env as any).PROD) {
      // Sentry.setUser(null);
    }
  } catch (err) {
    console.error('Clearing user context failed:', err);
  }
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (
  message: string,
  category: string = 'user-action',
  level: 'info' | 'warning' | 'error' = 'info'
): void => {
  try {
    if ((import.meta.env as any).PROD) {
      // Sentry.addBreadcrumb({
      //   message,
      //   category,
      //   level,
      //   timestamp: Date.now() / 1000,
      // });
    }
  } catch (err) {
    console.error('Adding breadcrumb failed:', err);
  }
};

/**
 * Report API error
 */
export const reportApiError = (
  error: Error | unknown,
  endpoint: string,
  method: string,
  statusCode?: number
): void => {
  const context: ErrorContext = {
    type: 'api_error',
    endpoint,
    method,
    statusCode,
  };

  captureException(error, context);
};

/**
 * Report validation error
 */
export const reportValidationError = (
  fieldName: string,
  value: unknown,
  rule: string
): void => {
  const message = `Validation failed for field "${fieldName}" with rule "${rule}"`;
  const context: ErrorContext = {
    type: 'validation_error',
    fieldName,
    value,
    rule,
  };

  captureMessage(message, 'warning');
};

/**
 * Report performance issue
 */
export const reportPerformanceIssue = (
  operation: string,
  duration: number,
  threshold: number
): void => {
  if (duration > threshold) {
    const message = `Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`;
    const context: ErrorContext = {
      type: 'performance_issue',
      operation,
      duration,
      threshold,
    };

    captureMessage(message, 'warning');
  }
};

/**
 * Report offline sync error
 */
export const reportOfflineSyncError = (
  action: string,
  error: Error | unknown,
  retryCount: number
): void => {
  const context: ErrorContext = {
    type: 'offline_sync_error',
    action,
    retryCount,
  };

  captureException(error, context);
};

export default {
  initializeErrorReporter,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  reportApiError,
  reportValidationError,
  reportPerformanceIssue,
  reportOfflineSyncError,
};
