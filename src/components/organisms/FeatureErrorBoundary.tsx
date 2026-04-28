import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

/**
 * Feature-level Error Boundary
 * Catches errors in feature modules and displays a fallback UI
 * Use this to wrap individual features/pages for better error isolation
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error(`Error in ${this.props.featureName || 'feature'}:`, error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <Icon 
            name="AlertTriangle" 
            size={48} 
            className="text-warning-500 mb-4" 
          />
          
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          
          <p className="text-neutral-600 dark:text-neutral-400 text-center mb-4 max-w-md">
            {this.props.featureName 
              ? `There was an error loading ${this.props.featureName}. Please try again.`
              : 'An unexpected error occurred. Please try again.'}
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details className="mb-4 w-full max-w-md">
              <summary className="cursor-pointer text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                Error details
              </summary>
              <pre className="text-xs text-danger-600 dark:text-danger-400 bg-neutral-100 dark:bg-neutral-800 p-3 rounded overflow-auto max-h-[200px]">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="primary" onClick={this.handleRetry}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with FeatureErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<Props, 'children'> = {}
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <FeatureErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </FeatureErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

export default FeatureErrorBoundary;
