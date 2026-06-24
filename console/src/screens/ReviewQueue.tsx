import { AlertCircle, ThumbsUp, ThumbsDown, PartyPopper } from 'lucide-react'
import { useLiveReviewQueue, useReviewDecision } from '@/data/useReviewQueue'
import { SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge } from '@/components/Badge'
import { useToast } from '@/components/feedback/Toast'
import { fmtRelative, titleCase } from '@/lib/format'
import type { ReviewPriority } from '@/data/types'

function priorityTone(p: ReviewPriority) {
  return p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'accent'
}

export function ReviewQueue() {
  const { data, isLoading, isError, error, retry } = useLiveReviewQueue()
  const decide = useReviewDecision()
  const toast = useToast()

  const onDecide = (id: string, title: string, decision: 'approved' | 'rejected') => {
    decide.mutate(
      { id, decision },
      {
        onSuccess: () =>
          toast.show({
            type: decision === 'approved' ? 'success' : 'info',
            message: `${title} ${decision}`,
          }),
        onError: (e) =>
          toast.show({
            type: 'error',
            message: e instanceof Error ? e.message : 'Could not save decision',
          }),
      },
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-fg">Review Queue</h1>
        <p className="mt-2 text-muted">
          {data ? `${data.length} item${data.length === 1 ? '' : 's'} pending review` : 'Manual review of flagged items'}
        </p>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorState error={error} onRetry={retry} />}

      {data &&
        (data.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="Queue is clear"
            message="Nothing is waiting for review right now."
          />
        ) : (
          <div className="space-y-4">
            {data.map((review) => (
              <div key={review.id} className="rounded-lg border border-hair bg-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-warning" />
                      <h3 className="truncate text-lg font-semibold text-fg">
                        {review.title}
                      </h3>
                    </div>
                    <p className="mb-3 text-sm text-muted">{review.reason}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-faint">
                      <span>Source: {review.submittedBy}</span>
                      <Badge tone={priorityTone(review.priority)}>
                        {titleCase(review.priority)} priority
                      </Badge>
                      {review.createdAt && <span>{fmtRelative(review.createdAt)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDecide(review.id, review.title, 'approved')}
                      disabled={decide.isPending}
                      aria-label={`Approve ${review.title}`}
                      className="rounded bg-success/10 p-2 text-success transition-colors hover:bg-success/20 disabled:opacity-50"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDecide(review.id, review.title, 'rejected')}
                      disabled={decide.isPending}
                      aria-label={`Reject ${review.title}`}
                      className="rounded bg-danger/10 p-2 text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
                    >
                      <ThumbsDown className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
