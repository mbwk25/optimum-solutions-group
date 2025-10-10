import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';

type ErrorLevel = 'app' | 'page' | 'section' | 'component';

interface Props {
  children: ReactNode;
  level?: ErrorLevel;
  isolate?: boolean;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeout?: ReturnType<typeof setTimeout>;
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log errors in non-test environments
    if (import.meta.env.MODE !== 'test') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  getErrorTitle = (): string => {
    const { level = 'component' }: Props = this.props;
    switch (level) {
      case 'app':
        return 'Application Error';
      case 'page':
        return 'Page Error';
      case 'section':
        return 'Section Error';
      case 'component':
        return 'Component Error';
      default:
        return 'Something went wrong';
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided (accepts 0, '' etc.; exclude only null/undefined)
      const { fallback } = this.props;
      if (fallback != null) {
        return fallback;
      }
      const isDevelopment: boolean = import.meta.env.DEV;
      const errorTitle: string = this.getErrorTitle();

      return (
        // @ts-ignore
          <div className={`flex flex-col items-center justify-center p-4 ${this.props.isolate ? 'min-h-32' : 'min-h-screen'}`}>
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">{errorTitle}</h1>
          
          {isDevelopment && this.state.error && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg max-w-md">
              <h3 className="font-semibold mb-2">Error Details (Development Only)</h3>
              <p className="text-sm text-gray-700">{this.state.error?.message}</p>
              <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
          
          <Button onClick={this.handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;