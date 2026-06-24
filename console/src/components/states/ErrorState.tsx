import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/Button'

interface ErrorStateProps {
  title?: string
  error?: unknown
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
}: ErrorStateProps) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : undefined

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger/5 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-danger/10 p-3">
        <AlertTriangle className="h-6 w-6 text-danger" />
      </div>
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {message && (
        <p className="mt-1 max-w-md break-words text-sm text-muted">{message}</p>
      )}
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
