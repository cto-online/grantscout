import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded font-medium transition-colors disabled:opacity-50',
          variant === 'primary' &&
            'bg-accent text-fg hover:bg-accent-hover',
          variant === 'secondary' &&
            'bg-card text-muted hover:bg-hair',
          variant === 'danger' &&
            'bg-danger text-fg hover:opacity-90',
          size === 'sm' && 'px-2 py-1 text-xs',
          size === 'md' && 'px-3 py-2 text-sm',
          size === 'lg' && 'px-4 py-3 text-base',
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
