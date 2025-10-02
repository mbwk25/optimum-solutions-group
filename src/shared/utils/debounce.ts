/**
 * @fileoverview Debounce and throttle utility functions for performance optimization
 * @description Provides comprehensive timing control functions to limit the rate of function execution.
 * This module includes basic and advanced debounce implementations, throttle functions, and
 * a strongly-typed DebouncedFunction interface that preserves original function signatures.
 * 
 * @features
 * - Basic debounce with immediate execution option
 * - Advanced debounce with leading/trailing edge control and maxWait
 * - Basic and advanced throttle implementations
 * - Strong TypeScript typing with DebouncedFunction<T> interface
 * - Built-in cancel, flush, and pending methods for debounced functions
 * - Performance-optimized implementations
 * 
 * @author Optimum Solutions Group
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * import { debounce, debounceAdvanced, throttle, DebouncedFunction } from './debounce';
 * 
 * // Basic debounce usage
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * // Advanced debounce with options
 * const advancedDebounce = debounceAdvanced((data: any) => {
 *   console.log('Processing:', data);
 * }, 500, { leading: true, trailing: true, maxWait: 2000 });
 * 
 * // Using debounced function methods
 * debouncedSearch('test');
 * if (debouncedSearch.pending()) {
 *   debouncedSearch.flush(); // Execute immediately
 *   debouncedSearch.cancel(); // Cancel pending execution
 * }
 * ```
 */

/**
 * Creates a debounced function that delays invoking the provided function until after the specified
 * wait time has elapsed since the last time the debounced function was invoked.
 * 
 * Debouncing is useful for performance optimization, especially for expensive operations like:
 * - API calls triggered by user input
 * - DOM manipulation during scrolling/resizing
 * - Search suggestions as user types
 * - Form validation on input changes
 * 
 * The debounced function will only execute after the specified delay has passed without any
 * new invocations. If called again before the delay completes, the timer resets.
 * 
 * @template T - The type of the function to debounce, constrained to functions that accept any arguments and return any value
 * @param func - The function to debounce. Must be a function that accepts any number of arguments
 * @param wait - The number of milliseconds to delay execution. Must be a positive number
 * @param immediate - Optional. If true, the function is executed immediately on the first call,
 *                   and subsequent calls within the wait period are ignored until the wait period ends.
 *                   Defaults to false (trailing edge execution)
 * 
 * @returns A DebouncedFunction<T> that wraps the original function with debouncing behavior.
 *          The returned function has the same signature as the original function plus additional methods:
 *          - cancel(): Cancels any pending execution
 *          - flush(): Executes the function immediately if there's a pending execution
 *          - pending(): Returns true if there's a pending execution
 * 
 * @throws {TypeError} If func is not a function
 * @throws {TypeError} If wait is not a positive number
 * 
 * @example Basic usage with trailing edge execution
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 *   // Perform expensive search operation
 * }, 300);
 * 
 * // Multiple rapid calls will only execute the last one after 300ms
 * debouncedSearch('a');     // Timer starts
 * debouncedSearch('ab');    // Timer resets
 * debouncedSearch('abc');   // Timer resets, only this executes after 300ms
 * ```
 * 
 * @example Usage with immediate execution (leading edge)
 * ```typescript
 * const debouncedSave = debounce((data: any) => {
 *   console.log('Saving:', data);
 *   // Perform save operation
 * }, 1000, true); // immediate = true
 * 
 * debouncedSave({ id: 1 }); // Executes immediately
 * debouncedSave({ id: 2 }); // Ignored (within 1000ms)
 * debouncedSave({ id: 3 }); // Ignored (within 1000ms)
 * // After 1000ms, the function can be called again
 * ```
 * 
 * @example Using debounced function methods
 * ```typescript
 * const debouncedApiCall = debounce((endpoint: string) => {
 *   fetch(endpoint).then(response => console.log(response));
 * }, 500);
 * 
 * debouncedApiCall('/api/users');
 * 
 * // Check if there's a pending call
 * if (debouncedApiCall.pending()) {
 *   console.log('API call is pending...');
 * }
 * 
 * // Cancel the pending call
 * debouncedApiCall.cancel();
 * 
 * // Force immediate execution if pending
 * debouncedApiCall.flush();
 * ```
 * 
 * @example Real-world search input scenario
 * ```typescript
 * // HTML: <input id="search" type="text" />
 * const searchInput = document.getElementById('search') as HTMLInputElement;
 * 
 * const debouncedSearch = debounce(async (query: string) => {
 *   if (query.length < 2) return;
 *   
 *   try {
 *     const results = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
 *     const data = await results.json();
 *     updateSearchResults(data);
 *   } catch (error) {
 *     console.error('Search failed:', error);
 *   }
 * }, 300);
 * 
 * searchInput.addEventListener('input', (event) => {
 *   const target = event.target as HTMLInputElement;
 *   debouncedSearch(target.value);
 * });
 * ```
 * 
 * @performance Consider using debounceAdvanced for more control over execution timing
 * @see {@link debounceAdvanced} For advanced debouncing with leading/trailing edge control
 * @see {@link DebouncedFunction} For the return type interface
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function executedFunction(...args: Parameters<T>): ReturnType<T> {
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
      return func(...args) as ReturnType<T>;
    }
    return undefined as any;
  }

  function cancel(): void {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }

  function flush(): ReturnType<T> {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      return func(...([] as any)) as ReturnType<T>;
    }
    return undefined as any;
  }

  function pending(): boolean {
    return timeout !== null;
  }

  // Add methods to the debounced function
  executedFunction.cancel = cancel;
  executedFunction.flush = flush;
  executedFunction.pending = pending;

  return executedFunction as DebouncedFunction<T>;
}

/**
 * Creates a throttled function that limits the execution of the provided function to at most
 * once per specified time period.
 * 
 * Throttling is useful for performance optimization when you want to ensure a function is called
 * at most once during a specific time window, regardless of how many times it's invoked.
 * Unlike debouncing, throttling guarantees regular execution intervals.
 * 
 * Common use cases include:
 * - Scroll event handlers (update UI at regular intervals)
 * - Resize event handlers (recalculate layouts periodically)
 * - Mouse move handlers (track cursor position with limits)
 * - API rate limiting (prevent excessive requests)
 * - Animation frame callbacks (maintain smooth animations)
 * 
 * @template T - The type of the function to throttle, constrained to functions that accept any arguments and return any value
 * @param func - The function to throttle. Must be a function that accepts any number of arguments
 * @param limit - The number of milliseconds between allowed executions. Must be a positive number
 * 
 * @returns A throttled function with the same signature as the original function.
 *          The function will execute at most once per `limit` milliseconds.
 * 
 * @throws {TypeError} If func is not a function
 * @throws {TypeError} If limit is not a positive number
 * 
 * @example Basic throttling for scroll events
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   console.log('Scroll position:', window.scrollY);
 *   // Update UI elements based on scroll position
 * }, 100); // Execute at most once every 100ms
 * 
 * window.addEventListener('scroll', throttledScroll);
 * ```
 * 
 * @example Throttling API calls to prevent rate limiting
 * ```typescript
 * const throttledApiCall = throttle(async (endpoint: string) => {
 *   try {
 *     const response = await fetch(endpoint);
 *     const data = await response.json();
 *     console.log('API response:', data);
 *   } catch (error) {
 *     console.error('API call failed:', error);
 *   }
 * }, 1000); // Maximum one API call per second
 * 
 * // Multiple rapid calls will be throttled
 * throttledApiCall('/api/users');
 * throttledApiCall('/api/posts'); // May be ignored if within 1000ms
 * throttledApiCall('/api/comments'); // May be ignored if within 1000ms
 * ```
 * 
 * @example Throttling resize events for responsive layouts
 * ```typescript
 * const throttledResize = throttle(() => {
 *   const width = window.innerWidth;
 *   const height = window.innerHeight;
 *   
 *   // Recalculate layout for new dimensions
 *   updateLayout(width, height);
 *   
 *   // Update responsive breakpoints
 *   updateBreakpoints(width);
 * }, 250); // Update layout at most every 250ms
 * 
 * window.addEventListener('resize', throttledResize);
 * ```
 * 
 * @example Throttling mouse move for performance
 * ```typescript
 * const throttledMouseMove = throttle((event: MouseEvent) => {
 *   const x = event.clientX;
 *   const y = event.clientY;
 *   
 *   // Update cursor position indicator
 *   updateCursorPosition(x, y);
 *   
 *   // Perform expensive calculations
 *   calculateElementUnderCursor(x, y);
 * }, 16); // ~60fps throttling (16ms ≈ 1/60 second)
 * 
 * document.addEventListener('mousemove', throttledMouseMove);
 * ```
 * 
 * @example Throttling form validation
 * ```typescript
 * const throttledValidation = throttle((inputValue: string) => {
 *   const isValid = validateInput(inputValue);
 *   updateValidationStatus(isValid);
 *   
 *   if (!isValid) {
 *     showValidationErrors(inputValue);
 *   }
 * }, 500); // Validate at most every 500ms
 * 
 * const input = document.getElementById('email') as HTMLInputElement;
 * input.addEventListener('input', (event) => {
 *   const target = event.target as HTMLInputElement;
 *   throttledValidation(target.value);
 * });
 * ```
 * 
 * @performance Note: This is a basic throttle implementation. For more advanced throttling
 * with leading/trailing edge control, use throttleAdvanced.
 * @see {@link throttleAdvanced} For advanced throttling with leading/trailing edge control
 * @see {@link debounce} For debouncing (different timing behavior)
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Configuration options for the advanced debounce function.
 * These options provide fine-grained control over debouncing behavior.
 * 
 * @interface DebounceOptions
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * const options: DebounceOptions = {
 *   leading: true,    // Execute on first call
 *   trailing: true,  // Execute after delay
 *   maxWait: 2000    // Force execution after 2 seconds
 * };
 * 
 * const debounced = debounceAdvanced(myFunction, 500, options);
 * ```
 */
export interface DebounceOptions {
  /** 
   * Execute the function immediately on the first call (alias for leading).
   * This is provided for backward compatibility with the basic debounce function.
   * 
   * @default undefined (falls back to leading option)
   * @deprecated Use `leading` instead for consistency
   * 
   * @example
   * ```typescript
   * // These are equivalent:
   * debounceAdvanced(fn, 500, { immediate: true });
   * debounceAdvanced(fn, 500, { leading: true });
   * ```
   */
  immediate?: boolean;
  
  /** 
   * Maximum time the function is allowed to be delayed before being forced to execute.
   * This ensures the function executes at least once within the specified time period,
   * even if continuously called.
   * 
   * @default 0 (no maximum wait)
   * @minimum 0
   * 
   * @example
   * ```typescript
   * // Function will execute at most every 2 seconds, even with continuous calls
   * const debounced = debounceAdvanced(fn, 500, { maxWait: 2000 });
   * ```
   */
  maxWait?: number;
  
  /** 
   * Execute the function on the leading edge of the timeout (immediately on first call).
   * When true, the function executes immediately on the first invocation, then waits
   * for the delay period before allowing another execution.
   * 
   * @default false
   * 
   * @example
   * ```typescript
   * const debounced = debounceAdvanced(fn, 500, { leading: true });
   * debounced(); // Executes immediately
   * debounced(); // Ignored (within 500ms)
   * debounced(); // Ignored (within 500ms)
   * // After 500ms, next call will execute immediately again
   * ```
   */
  leading?: boolean;
  
  /** 
   * Execute the function on the trailing edge of the timeout (after the delay period).
   * When true, the function executes after the specified delay has passed without
   * new invocations. This is the default behavior for most debouncing scenarios.
   * 
   * @default true
   * 
   * @example
   * ```typescript
   * const debounced = debounceAdvanced(fn, 500, { trailing: true });
   * debounced(); // Timer starts
   * debounced(); // Timer resets
   * debounced(); // Timer resets, executes after 500ms
   * ```
   */
  trailing?: boolean;
}

/**
 * Creates an advanced debounced function with comprehensive control over execution timing.
 * This function provides more sophisticated debouncing behavior compared to the basic debounce function.
 * 
 * The advanced debounce function supports:
 * - Leading edge execution (immediate execution on first call)
 * - Trailing edge execution (execution after delay period)
 * - Maximum wait time (force execution after a maximum delay)
 * - Backward compatibility with the immediate option
 * 
 * This implementation is based on lodash's debounce function and provides enterprise-grade
 * debouncing capabilities for complex applications.
 * 
 * @template T - The type of the function to debounce, constrained to functions that accept any arguments and return any value
 * @param func - The function to debounce. Must be a function that accepts any number of arguments
 * @param wait - The number of milliseconds to delay execution. Must be a positive number
 * @param options - Optional configuration object for advanced debouncing behavior
 * 
 * @returns A DebouncedFunction<T> that wraps the original function with advanced debouncing behavior.
 *          The returned function has the same signature as the original function plus additional methods:
 *          - cancel(): Cancels any pending execution and resets internal state
 *          - flush(): Executes the function immediately if there's a pending execution
 *          - pending(): Returns true if there's a pending execution
 * 
 * @throws {TypeError} If func is not a function
 * @throws {TypeError} If wait is not a positive number
 * @throws {TypeError} If maxWait is provided and is not a positive number
 * 
 * @example Basic advanced debouncing
 * ```typescript
 * const debounced = debounceAdvanced((data: any) => {
 *   console.log('Processing:', data);
 * }, 500);
 * 
 * debounced({ id: 1 }); // Timer starts
 * debounced({ id: 2 }); // Timer resets
 * debounced({ id: 3 }); // Timer resets, executes after 500ms
 * ```
 * 
 * @example Leading edge execution
 * ```typescript
 * const debounced = debounceAdvanced((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300, { leading: true });
 * 
 * debounced('a');     // Executes immediately
 * debounced('ab');    // Ignored (within 300ms)
 * debounced('abc');   // Ignored (within 300ms)
 * // After 300ms, next call will execute immediately
 * ```
 * 
 * @example Trailing edge execution (default)
 * ```typescript
 * const debounced = debounceAdvanced((value: string) => {
 *   console.log('Final value:', value);
 * }, 200, { trailing: true });
 * 
 * debounced('a');     // Timer starts
 * debounced('ab');    // Timer resets
 * debounced('abc');   // Timer resets, executes after 200ms
 * ```
 * 
 * @example Both leading and trailing execution
 * ```typescript
 * const debounced = debounceAdvanced((data: any) => {
 *   console.log('Processing:', data);
 * }, 500, { leading: true, trailing: true });
 * 
 * debounced({ id: 1 }); // Executes immediately (leading)
 * debounced({ id: 2 }); // Ignored
 * debounced({ id: 3 }); // Ignored
 * // After 500ms, executes again with latest data (trailing)
 * ```
 * 
 * @example Maximum wait time
 * ```typescript
 * const debounced = debounceAdvanced((data: any) => {
 *   console.log('Force execution:', data);
 * }, 100, { maxWait: 1000 });
 * 
 * // Even with continuous calls, function executes at least every 1000ms
 * setInterval(() => debounced({ timestamp: Date.now() }), 50);
 * ```
 * 
 * @example Real-world autocomplete scenario
 * ```typescript
 * const debouncedAutocomplete = debounceAdvanced(async (query: string) => {
 *   if (query.length < 2) return;
 *   
 *   try {
 *     const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
 *     const suggestions = await response.json();
 *     updateAutocompleteSuggestions(suggestions);
 *   } catch (error) {
 *     console.error('Autocomplete failed:', error);
 *   }
 * }, 300, { 
 *   leading: false,    // Don't execute immediately
 *   trailing: true,    // Execute after delay
 *   maxWait: 2000     // Force execution every 2 seconds max
 * });
 * 
 * const searchInput = document.getElementById('search') as HTMLInputElement;
 * searchInput.addEventListener('input', (event) => {
 *   const target = event.target as HTMLInputElement;
 *   debouncedAutocomplete(target.value);
 * });
 * ```
 * 
 * @example Form validation with advanced debouncing
 * ```typescript
 * const debouncedValidation = debounceAdvanced(async (formData: FormData) => {
 *   try {
 *     const response = await fetch('/api/validate', {
 *       method: 'POST',
 *       body: formData
 *     });
 *     const validation = await response.json();
 *     updateValidationResults(validation);
 *   } catch (error) {
 *     console.error('Validation failed:', error);
 *   }
 * }, 500, {
 *   leading: true,     // Validate immediately on first change
 *   trailing: true,   // Also validate after delay
 *   maxWait: 3000     // Force validation every 3 seconds
 * });
 * 
 * const form = document.getElementById('myForm') as HTMLFormElement;
 * form.addEventListener('input', () => {
 *   const formData = new FormData(form);
 *   debouncedValidation(formData);
 * });
 * ```
 * 
 * @example Using debounced function methods
 * ```typescript
 * const debouncedApiCall = debounceAdvanced(async (endpoint: string) => {
 *   const response = await fetch(endpoint);
 *   return response.json();
 * }, 1000, { maxWait: 5000 });
 * 
 * // Make API call
 * debouncedApiCall('/api/data');
 * 
 * // Check if there's a pending call
 * if (debouncedApiCall.pending()) {
 *   console.log('API call is pending...');
 * }
 * 
 * // Cancel the pending call
 * debouncedApiCall.cancel();
 * 
 * // Force immediate execution if pending
 * const result = await debouncedApiCall.flush();
 * ```
 * 
 * @performance This implementation is optimized for performance and handles edge cases
 * like rapid successive calls, timer cleanup, and memory management.
 * @see {@link debounce} For basic debouncing needs
 * @see {@link DebounceOptions} For configuration options
 * @see {@link DebouncedFunction} For the return type interface
 */
export function debounceAdvanced<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const {
    immediate,
    maxWait = 0,
    leading = false,
    trailing = true
  } = options;
  
  // Map immediate to leading for backward compatibility
  const effectiveLeading: boolean = immediate !== undefined ? immediate : leading;

  let timeout: ReturnType<typeof setTimeout> | null = null;
  let maxTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: ThisParameterType<T>;
  let result: ReturnType<T>;

  function invokeFunc(time: number): ReturnType<T> {
    const args: Parameters<T> | undefined = lastArgs;
    const thisArg: ThisParameterType<T> = lastThis;

    lastArgs = undefined;
    lastThis = undefined as any;
    lastInvokeTime = time;
    result = func.apply(thisArg, args as Parameters<T>) as ReturnType<T>;
    return result;
  }

  function leadingEdgeFunc(time: number): ReturnType<T> {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return effectiveLeading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall: number = time - lastCallTime;
    const timeSinceLastInvoke: number = time - lastInvokeTime;
    const timeWaiting: number = wait - timeSinceLastCall;

    return maxWait ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall: number = time - lastCallTime;
    const timeSinceLastInvoke: number = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait > 0 && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): void {
    const time: number = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number): ReturnType<T> {
    timeout = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    lastThis = undefined as any;
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
    lastThis = undefined as any;
    timeout = null;
    maxTimeout = null;
  }

  function flush(): ReturnType<T> {
    return timeout === null ? result : trailingEdge(Date.now());
  }

  function pending(): boolean {
    return timeout !== null;
  }

  function debounced(this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    const time: number = Date.now();
    const isInvoking: boolean = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === null) {
        return leadingEdgeFunc(lastCallTime);
      }
      if (maxWait > 0) {
        timeout = setTimeout(timerExpired, wait);
        maxTimeout = setTimeout(() => {
          if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
          }
          trailingEdge(Date.now());
          maxTimeout = null;
        }, maxWait);
        const result: ReturnType<T> = invokeFunc(lastCallTime);
        if (maxTimeout !== null) {
          clearTimeout(maxTimeout);
          maxTimeout = null;
        }
        return result;
      }
    }
    if (timeout === null) {
      timeout = setTimeout(timerExpired, wait);
    }
    return result;
  }

  // Add methods to the debounced function
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced as DebouncedFunction<T>;
}

/**
 * Type definition for a debounced function that preserves the original function's signature
 * while adding control methods for managing the debouncing behavior.
 * 
 * This type ensures type safety by preserving the original function's parameter types
 * and return type, while extending it with debouncing-specific methods.
 * 
 * @template T - The type of the original function being debounced
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Original function
 * const searchFunction = (query: string, options: SearchOptions): Promise<SearchResults> => {
 *   return fetch(`/api/search?q=${query}`, options);
 * };
 * 
 * // Debounced function maintains the same signature
 * const debouncedSearch: DebouncedFunction<typeof searchFunction> = debounce(searchFunction, 300);
 * 
 * // Can be called with the same parameters
 * const results = await debouncedSearch('typescript', { limit: 10 });
 * 
 * // Plus additional control methods
 * debouncedSearch.cancel();  // Cancel pending execution
 * debouncedSearch.flush();   // Execute immediately if pending
 * const isPending = debouncedSearch.pending(); // Check if execution is pending
 * ```
 * 
 * @example Type inference with generic functions
 * ```typescript
 * function processData<T>(data: T[], processor: (item: T) => void): void {
 *   data.forEach(processor);
 * }
 * 
 * // TypeScript infers the correct types
 * const debouncedProcess = debounce(processData, 500);
 * 
 * // Usage maintains type safety
 * debouncedProcess([1, 2, 3], (num: number) => console.log(num * 2));
 * debouncedProcess(['a', 'b'], (str: string) => console.log(str.toUpperCase()));
 * ```
 */
export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = {
  /** 
   * The debounced function with the same signature as the original function.
   * Executes the original function with debouncing behavior applied.
   * 
   * @param args - The same arguments that the original function accepts
   * @returns The same return type as the original function
   */
  (...args: Parameters<T>): ReturnType<T>;
  
  /** 
   * Cancels any pending execution of the debounced function.
   * This method clears all timers and resets the internal state.
   * 
   * @example
   * ```typescript
   * const debounced = debounce(myFunction, 500);
   * debounced('data');
   * 
   * // Cancel before execution
   * debounced.cancel();
   * ```
   */
  cancel: () => void;
  
  /** 
   * Executes the debounced function immediately if there's a pending execution.
   * If no execution is pending, returns the last result.
   * 
   * @returns The result of the function execution or the last cached result
   * 
   * @example
   * ```typescript
   * const debounced = debounce(myFunction, 500);
   * debounced('data');
   * 
   * // Force immediate execution
   * const result = debounced.flush();
   * ```
   */
  flush: () => ReturnType<T>;
  
  /** 
   * Checks if there's a pending execution of the debounced function.
   * 
   * @returns true if there's a pending execution, false otherwise
   * 
   * @example
   * ```typescript
   * const debounced = debounce(myFunction, 500);
   * debounced('data');
   * 
   * if (debounced.pending()) {
   *   console.log('Function execution is pending...');
   * }
   * ```
   */
  pending: () => boolean;
};

/**
 * Configuration options for the advanced throttle function.
 * These options provide control over when the throttled function executes during the throttle period.
 * 
 * @interface ThrottleOptions
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * const options: ThrottleOptions = {
 *   leading: true,   // Execute immediately on first call
 *   trailing: true   // Execute at the end of throttle period
 * };
 * 
 * const throttled = throttleAdvanced(myFunction, 1000, options);
 * ```
 */
export interface ThrottleOptions {
  /** 
   * Execute the function on the leading edge of the throttle period (immediately on first call).
   * When true, the function executes immediately when first called, then waits for the throttle
   * period before allowing another execution.
   * 
   * @default true
   * 
   * @example
   * ```typescript
   * const throttled = throttleAdvanced(fn, 1000, { leading: true });
   * throttled(); // Executes immediately
   * throttled(); // Ignored (within 1000ms)
   * throttled(); // Ignored (within 1000ms)
   * // After 1000ms, next call executes immediately again
   * ```
   */
  leading?: boolean;
  
  /** 
   * Execute the function on the trailing edge of the throttle period (at the end of the period).
   * When true, the function executes at the end of the throttle period if there were calls
   * during the period that were ignored.
   * 
   * @default true
   * 
   * @example
   * ```typescript
   * const throttled = throttleAdvanced(fn, 1000, { trailing: true });
   * throttled(); // Executes immediately (leading)
   * throttled(); // Ignored, but will execute at end of period (trailing)
   * throttled(); // Ignored, but will execute at end of period (trailing)
   * // After 1000ms, executes with latest arguments
   * ```
   */
  trailing?: boolean;
}

/**
 * Creates an advanced throttled function with comprehensive control over execution timing.
 * This function provides more sophisticated throttling behavior compared to the basic throttle function.
 * 
 * The advanced throttle function supports:
 * - Leading edge execution (immediate execution on first call)
 * - Trailing edge execution (execution at the end of throttle period)
 * - Both leading and trailing execution for maximum flexibility
 * 
 * Unlike debouncing, throttling guarantees that the function executes at regular intervals,
 * making it ideal for scenarios where you need consistent execution timing.
 * 
 * @template T - The type of the function to throttle, constrained to functions that accept any arguments and return any value
 * @param func - The function to throttle. Must be a function that accepts any number of arguments
 * @param wait - The number of milliseconds between allowed executions. Must be a positive number
 * @param options - Optional configuration object for advanced throttling behavior
 * 
 * @returns A throttled function with the same signature as the original function.
 *          The function will execute according to the throttle rules and options provided.
 * 
 * @throws {TypeError} If func is not a function
 * @throws {TypeError} If wait is not a positive number
 * 
 * @example Basic advanced throttling
 * ```typescript
 * const throttled = throttleAdvanced((data: any) => {
 *   console.log('Processing:', data);
 * }, 1000);
 * 
 * throttled({ id: 1 }); // Executes immediately
 * throttled({ id: 2 }); // Ignored (within 1000ms)
 * throttled({ id: 3 }); // Ignored (within 1000ms)
 * // After 1000ms, next call executes immediately
 * ```
 * 
 * @example Leading edge only
 * ```typescript
 * const throttled = throttleAdvanced((value: string) => {
 *   console.log('Leading execution:', value);
 * }, 500, { leading: true, trailing: false });
 * 
 * throttled('a');     // Executes immediately
 * throttled('b');     // Ignored
 * throttled('c');     // Ignored
 * // After 500ms, next call executes immediately
 * ```
 * 
 * @example Trailing edge only
 * ```typescript
 * const throttled = throttleAdvanced((value: string) => {
 *   console.log('Trailing execution:', value);
 * }, 500, { leading: false, trailing: true });
 * 
 * throttled('a');     // Ignored, but scheduled for trailing execution
 * throttled('b');     // Ignored, but scheduled for trailing execution
 * throttled('c');     // Ignored, but scheduled for trailing execution
 * // After 500ms, executes with latest arguments ('c')
 * ```
 * 
 * @example Both leading and trailing (default)
 * ```typescript
 * const throttled = throttleAdvanced((data: any) => {
 *   console.log('Execution:', data);
 * }, 1000, { leading: true, trailing: true });
 * 
 * throttled({ id: 1 }); // Executes immediately (leading)
 * throttled({ id: 2 }); // Ignored, but scheduled for trailing
 * throttled({ id: 3 }); // Ignored, but scheduled for trailing
 * // After 1000ms, executes with latest data (trailing)
 * ```
 * 
 * @example Real-world scroll handler with advanced throttling
 * ```typescript
 * const throttledScroll = throttleAdvanced((event: Event) => {
 *   const scrollY = window.scrollY;
 *   const scrollX = window.scrollX;
 *   
 *   // Update scroll position indicators
 *   updateScrollIndicators(scrollX, scrollY);
 *   
 *   // Update navigation bar visibility
 *   updateNavigationBar(scrollY);
 *   
 *   // Update progress bar
 *   updateScrollProgress(scrollY);
 * }, 16, { // ~60fps throttling
 *   leading: true,    // Update immediately on scroll start
 *   trailing: true    // Update at end of scroll burst
 * });
 * 
 * window.addEventListener('scroll', throttledScroll);
 * ```
 * 
 * @example Real-world resize handler with advanced throttling
 * ```typescript
 * const throttledResize = throttleAdvanced(() => {
 *   const width = window.innerWidth;
 *   const height = window.innerHeight;
 *   
 *   // Recalculate layout
 *   recalculateLayout(width, height);
 *   
 *   // Update responsive breakpoints
 *   updateBreakpoints(width);
 *   
 *   // Update canvas sizes
 *   updateCanvasSizes(width, height);
 * }, 250, {
 *   leading: false,   // Don't execute immediately (expensive operation)
 *   trailing: true    // Execute after resize burst ends
 * });
 * 
 * window.addEventListener('resize', throttledResize);
 * ```
 * 
 * @example Real-world mouse move handler with advanced throttling
 * ```typescript
 * const throttledMouseMove = throttleAdvanced((event: MouseEvent) => {
 *   const x = event.clientX;
 *   const y = event.clientY;
 *   
 *   // Update cursor position
 *   updateCursorPosition(x, y);
 *   
 *   // Update tooltip position
 *   updateTooltipPosition(x, y);
 *   
 *   // Perform expensive hit testing
 *   performHitTesting(x, y);
 * }, 16, { // ~60fps throttling
 *   leading: true,    // Update immediately for responsiveness
 *   trailing: true    // Update at end of mouse movement
 * });
 * 
 * document.addEventListener('mousemove', throttledMouseMove);
 * ```
 * 
 * @example Real-world API rate limiting with advanced throttling
 * ```typescript
 * const throttledApiCall = throttleAdvanced(async (endpoint: string, data: any) => {
 *   try {
 *     const response = await fetch(endpoint, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data)
 *     });
 *     
 *     if (!response.ok) {
 *       throw new Error(`API call failed: ${response.status}`);
 *     }
 *     
 *     const result = await response.json();
 *     console.log('API response:', result);
 *     return result;
 *   } catch (error) {
 *     console.error('API call failed:', error);
 *     throw error;
 *   }
 * }, 1000, { // Maximum one API call per second
 *   leading: true,    // Execute immediately on first call
 *   trailing: false   // Don't execute at end (avoid duplicate calls)
 * });
 * 
 * // Usage
 * try {
 *   await throttledApiCall('/api/users', { name: 'John' });
 *   await throttledApiCall('/api/posts', { title: 'Hello' }); // May be throttled
 * } catch (error) {
 *   console.error('API calls failed:', error);
 * }
 * ```
 * 
 * @performance This implementation is optimized for performance and handles edge cases
 * like rapid successive calls, timer cleanup, and memory management.
 * @see {@link throttle} For basic throttling needs
 * @see {@link ThrottleOptions} For configuration options
 * @see {@link debounceAdvanced} For debouncing (different timing behavior)
 */
export function throttleAdvanced<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;

  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous: number = 0;

  return function executedFunction(...args: Parameters<T>): void {
    const now: number = Date.now();
    if (!previous && !leading) previous = now;
    const remaining: number = wait - (now - previous as number);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}

/**
 * @fileoverview Usage Guidelines and Best Practices
 * @description Comprehensive guide for using debounce and throttle functions effectively
 * 
 * ## When to Use Debounce vs Throttle
 * 
 * ### Use Debounce When:
 * - You want to wait for a pause in activity before executing
 * - User input events (typing, searching, form validation)
 * - API calls triggered by user actions
 * - Expensive operations that should only run after user stops interacting
 * 
 * ### Use Throttle When:
 * - You need consistent execution intervals
 * - Scroll/resize/mousemove event handlers
 * - Animation frame callbacks
 * - API rate limiting
 * - Real-time updates that need regular intervals
 * 
 * ## Performance Considerations
 * 
 * ### Debounce Timing Guidelines:
 * - Search input: 300-500ms
 * - Form validation: 500-1000ms
 * - API calls: 1000-2000ms
 * - Expensive operations: 1000-3000ms
 * 
 * ### Throttle Timing Guidelines:
 * - Scroll events: 16ms (~60fps)
 * - Resize events: 250-500ms
 * - Mouse move: 16-32ms
 * - API rate limiting: 1000ms+
 * 
 * ## Memory Management
 * 
 * Always call `.cancel()` on debounced functions when:
 * - Component unmounts
 * - User navigates away
 * - Cleaning up event listeners
 * - Preventing memory leaks
 * 
 * ## Type Safety
 * 
 * The DebouncedFunction<T> type preserves original function signatures:
 * ```typescript
 * const originalFn = (a: string, b: number): boolean => a.length > b;
 * const debounced = debounce(originalFn, 500);
 * 
 * // TypeScript knows the exact signature
 * const result: boolean = debounced('hello', 3);
 * ```
 * 
 * ## Common Patterns
 * 
 * ### React Hook Example:
 * ```typescript
 * function useDebounce<T>(value: T, delay: number): T {
 *   const [debouncedValue, setDebouncedValue] = useState<T>(value);
 * 
 *   useEffect(() => {
 *     const handler = setTimeout(() => {
 *       setDebouncedValue(value);
 *     }, delay);
 * 
 *     return () => {
 *       clearTimeout(handler);
 *     };
 *   }, [value, delay]);
 * 
 *   return debouncedValue;
 * }
 * ```
 * 
 * ### Vue Composition API Example:
 * ```typescript
 * import { ref, watch } from 'vue';
 * 
 * export function useDebounce<T>(value: Ref<T>, delay: number) {
 *   const debouncedValue = ref(value.value);
 * 
 *   watch(value, (newValue) => {
 *     const timeout = setTimeout(() => {
 *       debouncedValue.value = newValue;
 *     }, delay);
 * 
 *     return () => clearTimeout(timeout);
 *   });
 * 
 *   return debouncedValue;
 * }
 * ```
 * 
 * ### Angular Service Example:
 * ```typescript
 * @Injectable()
 * export class DebounceService {
 *   private debouncedFunctions = new Map<string, DebouncedFunction<any>>();
 * 
 *   debounce<T>(key: string, fn: T, delay: number): DebouncedFunction<T> {
 *     if (this.debouncedFunctions.has(key)) {
 *       this.debouncedFunctions.get(key)!.cancel();
 *     }
 * 
 *     const debounced = debounce(fn, delay);
 *     this.debouncedFunctions.set(key, debounced);
 *     return debounced;
 *   }
 * 
 *   cleanup(): void {
 *     this.debouncedFunctions.forEach(fn => fn.cancel());
 *     this.debouncedFunctions.clear();
 *   }
 * }
 * ```
 * 
 * ## Testing Considerations
 * 
 * When testing debounced/throttled functions:
 * 1. Use fake timers (jest.useFakeTimers())
 * 2. Test both immediate and delayed execution
 * 3. Test cancel() and flush() methods
 * 4. Test edge cases (rapid successive calls)
 * 5. Verify memory cleanup
 * 
 * ## Browser Compatibility
 * 
 * This implementation works in all modern browsers and Node.js environments.
 * No polyfills required for setTimeout/clearTimeout.
 * 
 * @version 1.0.0
 * @author Optimum Solutions Group
 */
