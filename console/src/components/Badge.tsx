import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import type { Tier, RunStatus, ReviewStatus } from '@/data/types'

const badge = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-hair text-muted',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
        accent: 'bg-accent-soft text-accent',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type BadgeTone = NonNullable<VariantProps<typeof badge>['tone']>

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: React.ReactNode
}

export function Badge({ tone, className, children }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)}>{children}</span>
}

// ---- Shared tone mappings, so every screen colours statuses identically ----
export function tierTone(tier: Tier): BadgeTone {
  switch (tier) {
    case 'hot':
      return 'success'
    case 'warm':
      return 'warning'
    case 'cold_fit':
      return 'accent'
    default:
      return 'neutral'
  }
}

export function runStatusTone(status: RunStatus): BadgeTone {
  switch (status) {
    case 'success':
      return 'success'
    case 'running':
    case 'queued':
      return 'accent'
    case 'dry-run':
      return 'warning'
    case 'error':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function reviewStatusTone(status: ReviewStatus): BadgeTone {
  switch (status) {
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'warning'
  }
}

export function scoreTone(score: number): BadgeTone {
  if (score >= 85) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}
