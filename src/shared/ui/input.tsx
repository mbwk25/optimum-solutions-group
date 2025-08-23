import * as React from "react"
import { cn } from "@/shared/utils/utils"
import { useCallback } from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Indicates whether the input is in an invalid state
   */
  'aria-invalid'?: boolean | 'true' | 'false'
  /**
   * Identifies the element that provides an error message for the input
   */
  'aria-errormessage'?: string
  /**
   * Indicates whether the input is required
   */
  'aria-required'?: boolean
  /**
   * Indicates that the input is currently loading data
   */
  isLoading?: boolean
  /**
   * Optional prefix element to display before the input
   */
  addonBefore?: React.ReactNode
  /**
   * Optional suffix element to display after the input
   */
  addonAfter?: React.ReactNode
  /**
   * Optional ref for the wrapper div
   */
  wrapperRef?: React.Ref<HTMLDivElement>
  /**
   * Optional class name for the wrapper div
   */
  wrapperClassName?: string
}

/**
 * A customizable input component with built-in validation states and accessibility features.
 * Supports all standard input props and includes proper keyboard interaction.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    onChange,
    onBlur,
    onKeyDown,
    disabled,
    readOnly,
    'aria-invalid': ariaInvalid,
    'aria-errormessage': ariaErrormessage,
    'aria-describedby': ariaDescribedby,
    'aria-required': ariaRequired,
    required,
    isLoading = false,
    addonBefore,
    addonAfter,
    wrapperRef,
    wrapperClassName,
    ...props 
  }, ref) => {
    // Memoize event handlers
    const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    const handleBlur = useCallback<React.FocusEventHandler<HTMLInputElement>>((e) => {
      if (onBlur) {
        onBlur(e);
      }
    }, [onBlur]);

    const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLInputElement>>((e) => {
      // Allow parent key down handler to run first
      if (onKeyDown) {
        onKeyDown(e);
      }

      // Handle keyboard navigation
      if (e.key === 'Escape' && !e.defaultPrevented) {
        // Only clear if not disabled or read-only
        if (!disabled && !readOnly && onChange) {
          const target = e.target as HTMLInputElement;
          // Only clear if the input has a value
          if (target.value) {
            target.value = '';
            const event = Object.create(e, {
              target: { value: target },
              currentTarget: { value: target }
            });
            handleChange(event as React.ChangeEvent<HTMLInputElement>);
          }
        }
      }
    }, [disabled, readOnly, onChange, onKeyDown, handleChange]);

    // Determine if the input is invalid
    const isInvalid = ariaInvalid === true || 
                     ariaInvalid === 'true' || 
                     (props['aria-invalid'] !== undefined && props['aria-invalid'] !== 'false');

    // Combine aria-describedby values
    const describedBy = [
      ariaDescribedby,
      isInvalid && ariaErrormessage,
      props['aria-describedby']
    ].filter(Boolean).join(' ') || undefined;

    const isDisabled = disabled || isLoading;
    const showLoading = isLoading && !disabled;

    return (
      <div 
        ref={wrapperRef}
        className={cn(
          'relative flex w-full items-center',
          {
            'opacity-50': disabled || isLoading,
          },
          wrapperClassName
        )}
      >
        {addonBefore && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {addonBefore}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            { 'pl-10': addonBefore },
            { 'pr-10': addonAfter },
            className
          )}
          ref={ref}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          readOnly={readOnly}
          aria-invalid={isInvalid}
          aria-errormessage={isInvalid ? ariaErrormessage : undefined}
          aria-describedby={describedBy}
          aria-required={ariaRequired ?? required}
          aria-busy={isLoading}
          aria-disabled={isDisabled}
          {...props}
        />
        {addonAfter && !showLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {addonAfter}
          </div>
        )}
        {showLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="sr-only">Loading...</span>
          </div>
        )}
        {isInvalid && ariaErrormessage && (
          <span 
            className="absolute -bottom-5 left-0 text-xs text-destructive"
            id={ariaErrormessage}
            role="alert"
          >
            {props['aria-errormessage']}
          </span>
        )}
      </div>
    )
  }
);

Input.displayName = "Input"

export { Input }
