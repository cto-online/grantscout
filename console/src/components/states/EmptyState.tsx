import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  message?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hair bg-panel/50 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-accent-soft p-3">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {message && (
        <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
