import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            // Variants
            'bg-green-deep text-cream hover:bg-green-deep/90 focus-visible:ring-green-deep':
              variant === 'primary',
            'bg-cream text-green-deep border-green-deep hover:bg-cream-dark focus-visible:ring-green-deep border':
              variant === 'secondary',
            'text-text-dark hover:bg-cream-dark focus-visible:ring-green-deep bg-transparent':
              variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600':
              variant === 'danger',
            // Sizes
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-base': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
