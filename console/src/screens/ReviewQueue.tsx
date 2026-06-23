import { AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

export function ReviewQueue() {
  const pendingReviews = [
    {
      id: '1',
      title: 'Tech Innovation Grant 2024',
      priority: 'high',
      submittedBy: 'ANBI extractor',
      reason: 'Unusual amount: €5M',
    },
    {
      id: '2',
      title: 'Community Arts Fund',
      priority: 'medium',
      submittedBy: 'EU Grants extractor',
      reason: 'Duplicate detected - needs verification',
    },
    {
      id: '3',
      title: 'Environmental Research Initiative',
      priority: 'high',
      submittedBy: 'Manual entry',
      reason: 'Missing deadline information',
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-danger/10 text-danger'
      case 'medium':
        return 'bg-warning/10 text-warning'
      default:
        return 'bg-accent-soft text-accent'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">
          Review Queue
        </h1>
        <p className="mt-2 text-muted">
          {pendingReviews.length} items pending review
        </p>
      </div>

      <div className="space-y-4">
        {pendingReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-hair bg-panel p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <h3 className="font-semibold text-fg text-lg">
                    {review.title}
                  </h3>
                </div>
                <p className="text-sm text-muted mb-3">
                  {review.reason}
                </p>
                <div className="flex gap-4 text-xs text-faint">
                  <span>Source: {review.submittedBy}</span>
                  <span>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(
                        review.priority
                      )}`}
                    >
                      {review.priority} priority
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded bg-success/10 p-2 text-success hover:bg-success/20 transition-colors">
                  <ThumbsUp className="h-5 w-5" />
                </button>
                <button className="rounded bg-danger/10 p-2 text-danger hover:bg-danger/20 transition-colors">
                  <ThumbsDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
