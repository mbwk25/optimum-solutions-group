/**
 * @fileoverview Debounce and throttle utility functions for performance optimization
 * @description Provides timing control functions to limit the rate of function execution
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

/**
 * Debounce function that delays the execution of a function until after a specified wait time
 * has elapsed since the last time it was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @param immediate - If true, execute the function immediately on the first call
 * @returns The debounced function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   // Perform search
 * }, 300);
 * 
 * // Multiple rapid calls will only execute the last one after 300ms
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this will execute after 300ms
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>): void {
    const later = (): void => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Throttle function that limits the execution of a function to at most once per specified time period.
 * 
 * @param func - The function to throttle
 * @param limit - The number of milliseconds to throttle
 * @returns The throttled function
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   // Handle scroll event
 * }, 100);
 * 
 * // Multiple rapid calls will only execute once per 100ms
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Advanced debounce function with additional options for more control
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @param options - Additional options for debounce behavior
 * @returns The debounced function
 */
export interface DebounceOptions {
  /** Execute the function immediately on the first call */
  immediate?: boolean;
  /** Maximum time the function is allowed to be delayed */
  maxWait?: number;
  /** Execute the function on the leading edge of the timeout */
  leading?: boolean;
  /** Execute the function on the trailing edge of the timeout */
  trailing?: boolean;
}

export function debounceAdvanced<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): (...args: Parameters<T>) => void {
  const {
    maxWait = 0,
    leading = false,
    trailing = true
  } = options;

  let timeout: NodeJS.Timeout | null = null;
  let maxTimeout: NodeJS.Timeout | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: unknown;

  function invokeFunc(time: number): unknown {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args as Parameters<T>);
    return result;
  }

  function leadingEdgeFunc(time: number): unknown {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait > 0 && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number): unknown {
    timeout = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    lastThis = undefined;
    return result;
  }

  function cancel(): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    if (maxTimeout !== null) {
      clearTimeout(maxTimeout);
    }
    lastInvokeTime = 0;
    lastCallTime = 0;
    lastArgs = undefined;
    lastThis = undefined;
    timeout = null;
    maxTimeout = null;
  }

  function flush(): unknown {
    return timeout === null ? result : trailingEdge(Date.now());
  }

  function pending(): boolean {
    return timeout !== null;
  }

  function debounced(this: unknown, ...args: Parameters<T>): unknown {
    const time: number = Date.now();
    const isInvoking: boolean = shouldInvoke(time);

    lastArgs = args;
    lastThis = this as unknown;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === null) {
        return leadingEdgeFunc(lastCallTime) as unknown;
      }
      if (maxWait > 0) {
        timeout = setTimeout(timerExpired, wait);
        maxTimeout = setTimeout(() => {
          if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
          }
          trailingEdge(Date.now());
        }, maxWait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeout === null) {
      timeout = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced as (...args: Parameters<T>) => unknown & {
    cancel: () => void;
    flush: () => unknown;
    pending: () => boolean;
  };
}

/**
 * Throttle function with leading and trailing options
 * 
 * @param func - The function to throttle
 * @param wait - The number of milliseconds to throttle
 * @param options - Additional options for throttle behavior
 * @returns The throttled function
 */
export interface ThrottleOptions {
  /** Execute the function on the leading edge of the timeout */
  leading?: boolean;
  /** Execute the function on the trailing edge of the timeout */
  trailing?: boolean;
}

export function throttleAdvanced<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;

  let timeout: NodeJS.Timeout | null = null;
  let previous: number = 0;

  return function executedFunction(...args: Parameters<T>): void {
    const now: number = Date.now();
    if (!previous && !leading) previous = now as number;
    const remaining: number = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now as number;
      func(...args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now() as number;
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}
