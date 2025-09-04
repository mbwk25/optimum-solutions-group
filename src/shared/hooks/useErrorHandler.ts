export const useErrorHandler = (_options: ErrorHandlerOptions = {}) => {
  const handleError = (error: Error | string) => {
    console.error('Error:', error);
  };
  return { handleError };
};

export const useRetry = (maxRetries = 3, baseDelay = 1000) => {
  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retry(operation, retryCount + 1);
    }
  }, [maxRetries, baseDelay]);

  return { retry };
};

export default useErrorHandler;