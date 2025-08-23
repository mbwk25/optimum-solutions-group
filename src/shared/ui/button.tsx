import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils/utils"
import { useCallback } from "react"


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


const Button: React.FC<ButtonProps> = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    onClick,
    disabled,
    'aria-label': ariaLabel,
    'aria-busy': ariaBusy,
    children,
    ...props 
  }, ref) => {
    const Comp: React.ElementType = asChild ? Slot : "button"
    
    // Memoize the click handler with keyboard support
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback((
      e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
    ) => {
      if (!disabled && onClick) {
        if (e.type === 'keydown') {
          e.preventDefault();
        }
        // Only call onClick if it's a mouse event or if it's a keyboard event from Enter/Space
        if (e.type === 'click' || (e as React.KeyboardEvent).key === 'Enter' || (e as React.KeyboardEvent).key === ' ') {
          onClick(e as React.MouseEvent<HTMLButtonElement>);
        }
      }
    }, [onClick, disabled]);

    // Add keyboard event handler for accessibility
    const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent page scroll when space is pressed
        handleClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    }, [handleClick]);
    
    // Determine if the button is a loading state
    const isLoading: boolean = ariaBusy === 'true' || ariaBusy === true;
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          disabled && 'opacity-50 cursor-not-allowed',
          isLoading && 'relative'
        )}
        ref={ref}
        onClick={!disabled ? handleClick : undefined}
        onKeyDown={!disabled ? handleKeyDown : undefined}
        disabled={disabled}
        aria-disabled={disabled}
        aria-busy={isLoading}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        role={asChild ? undefined : 'button'}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            <span className="sr-only">Loading...</span>
          </span>
        )}
        <span className={cn(isLoading && 'invisible')}>
          {children}
        </span>
      </Comp>
    )
  }
))
Button.displayName = "Button"

// Export memoized version for direct usage
const MemoizedButton: React.FC<ButtonProps> = React.memo(Button);
MemoizedButton.displayName = "MemoizedButton";

export { Button, MemoizedButton, buttonVariants }
