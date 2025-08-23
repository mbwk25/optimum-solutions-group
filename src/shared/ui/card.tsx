import * as React from "react"
import { cn } from "@/shared/utils/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the card.
   * @default 'default'
   */
  variant?: 'default' | 'outline' | 'elevated'
  /**
   * If true, the card will have a hover effect.
   * @default false
   */
  hoverable?: boolean
  /**
   * If true, the card will have a border.
   * @default true
   */
  bordered?: boolean
  /**
   * The size of the card.
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * The role of the card element.
   * @default 'article'
   */
  role?: string
}

/**
 * A flexible card component that can be used to display content and actions.
 * Supports different variants, sizes, and interactive states.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    hoverable = false,
    bordered = true,
    size = 'default',
    role = 'article',
    ...props
  }, ref) => (
    <div
      ref={ref}
      role={role}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        {
          'border-border': bordered,
          'border-transparent': !bordered,
          'transition-shadow hover:shadow-md': hoverable,
          'p-4': size === 'default',
          'p-3': size === 'sm',
          'p-6': size === 'lg',
          'bg-background': variant === 'outline',
          'shadow-lg': variant === 'elevated',
        },
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * If true, adds padding to the header.
   * @default true
   */
  padded?: boolean
  /**
   * The alignment of the header content.
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padded = true, align = 'start', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        {
          'p-6': padded,
          'justify-start': align === 'start',
          'justify-center': align === 'center',
          'justify-end': align === 'end',
          'justify-between': align === 'between',
          'justify-around': align === 'around',
          'justify-evenly': align === 'evenly',
        },
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level (h1-h6).
   * @default 'h3'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * The size of the description text.
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg'
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size = 'default', ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        {
          'text-xs': size === 'sm',
          'text-sm': size === 'default',
          'text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * If true, adds padding to the content.
   * @default true
   */
  padded?: boolean
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padded = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        {
          'p-6 pt-0': padded,
        },
        className
      )}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The alignment of the footer content.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /**
   * If true, adds padding to the footer.
   * @default true
   */
  padded?: boolean
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({
    className,
    align = 'end',
    padded = true,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        {
          'p-6 pt-0': padded,
          'justify-start': align === 'start',
          'justify-center': align === 'center',
          'justify-end': align === 'end',
          'justify-between': align === 'between',
          'justify-around': align === 'around',
          'justify-evenly': align === 'evenly',
        },
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
