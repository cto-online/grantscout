import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'rounded border border-hair bg-card px-3 py-2 text-sm text-fg placeholder-faint focus:border-accent focus:outline-none transition-colors',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
