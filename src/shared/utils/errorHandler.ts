// Simplified error handler
export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
}

class ErrorHandler {
  handleError(error: Error, errorInfo?: ErrorInfo, context?: ErrorContext) {
    console.error('Error caught:', error);
    if (errorInfo) {
      console.error('Component stack:', errorInfo.componentStack);
    }
    if (context) {
      console.error('Context:', context);
    }
  }
}

const errorHandler = new ErrorHandler();
export default errorHandler;