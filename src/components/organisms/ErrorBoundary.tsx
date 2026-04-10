import React, { Component, ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console and send to monitoring if available
    // eslint-disable-next-line no-console
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
    // Optionally: Sentry.captureException(error, { extra: info });
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-4">
          <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">An unexpected error occurred. You can try again or go back to the home page.</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={this.reset}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-4 py-2 border rounded border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as any;
  }
}

export default ErrorBoundary;
