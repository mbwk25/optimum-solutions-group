import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/ui/button';
import { AlertTriangle, RefreshCw, Copy, ExternalLink, Home } from 'lucide-react';
import { errorHandler } from '@/shared/utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'app' | 'page' | 'section' | 'component';
  resetKeys?: Array<string | number>; // Keys that when changed, will reset the error boundary
  resetOnPropsChange?: boolean;
  isolate?: boolean; // If true, only shows minimal error UI without full page takeover
}

interface State {
  hasError: boolean;
  error: Error | undefined;
  errorInfo: ErrorInfo | undefined;
  eventId: string | undefined;
  retryCount: number;
  isRetrying: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | undefined;
  
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      eventId: undefined,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      isRetrying: false
    };
  }

  override componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.props.resetKeys && prevProps.resetKeys) {
      if (this.props.resetKeys.some((key, i) => key !== prevProps.resetKeys![i])) {
        if (this.state.hasError) {
          this.handleReset();
        }
      }
    }

    // Reset error boundary when props change (if enabled)
    if (this.props.resetOnPropsChange && this.state.hasError) {
      if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
        this.handleReset();
      }
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate a unique event ID for tracking
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    this.setState({ 
      errorInfo,
      eventId
    });

    // Use our enhanced error handler
    errorHandler.handleError(`ErrorBoundary caught error (${this.props.level || 'unknown'})`, {
      error: error.message,
      component: this.constructor.name,
      message: error.stack || 'No stack trace available',
      data: {
        error: error.toString(),
        errorInfo,
        eventId,
        retryCount: this.state.retryCount,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // In production, you would send this to your error tracking service
    // Example: Sentry.captureException(error, { 
    //   tags: { errorBoundary: true, level: this.props.level },
    //   extra: { ...errorInfo, eventId, retryCount: this.state.retryCount }
    // });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined,
      errorInfo: undefined,
      eventId: undefined,
      retryCount: 0,
      isRetrying: false
    });
    
    // Clear any pending retry timeout
    if (this.resetTimeoutId !== undefined) {
      window.clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = undefined;
    }
  };

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    this.setState({ 
      isRetrying: true,
      retryCount: newRetryCount
    });

    // Add a small delay before retry for better UX
    this.resetTimeoutId = window.setTimeout(() => {
      this.handleReset();
    }, 500);
  };

  copyErrorDetails = async () => {
    if (!this.state.error || !this.state.errorInfo) return;
    
    const errorDetails = {
      error: this.state.error.toString(),
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo.componentStack,
      eventId: this.state.eventId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount: this.state.retryCount
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      // Could show a toast notification here
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(errorDetails, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show isolated error UI for component-level errors
      if (this.props.isolate) {
        return (
          <div className="border border-destructive/20 rounded-lg p-6 bg-destructive/5 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-2">
              Component Error
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This component encountered an error and couldn't render.
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                size="sm"
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="flex items-center gap-1"
              >
                {this.state.isRetrying ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Retry
              </Button>
              {process.env['NODE_ENV'] === 'development' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={this.copyErrorDetails}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy Error
                </Button>
              )}
            </div>
          </div>
        );
      }

      // Full-page error UI
      const errorTitle = this.props.level === 'app' 
        ? 'Application Error'
        : this.props.level === 'page'
        ? 'Page Error'
        : 'Something went wrong';

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-lg mx-auto">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-destructive/10 p-6">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {errorTitle}
            </h1>
            
            {this.state.eventId && (
              <p className="text-xs font-mono text-muted-foreground mb-4 bg-muted px-3 py-1 rounded-full inline-block">
                Error ID: {this.state.eventId}
              </p>
            )}
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We encountered an unexpected error. Our team has been notified. 
              Please try the options below or contact support if the problem persists.
            </p>

            {this.state.retryCount > 0 && (
              <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Retry attempt {this.state.retryCount}</strong> - If the error persists, 
                  try refreshing the entire page.
                </p>
              </div>
            )}

            {process.env['NODE_ENV'] === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Error Details (Development Only)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Error Message:</h4>
                    <pre className="text-xs text-destructive bg-destructive/5 p-2 rounded overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Stack Trace:</h4>
                      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Component Stack:</h4>
                      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="flex items-center gap-2"
              >
                {this.state.isRetrying ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>

              <Button 
                onClick={() => window.location.href = '/'}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            {process.env['NODE_ENV'] === 'development' && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex gap-2 justify-center">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={this.copyErrorDetails}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Error Details
                  </Button>
                  
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open('https://github.com/optimum-solutions/issues/new', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Report Issue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;