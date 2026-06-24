import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useRun, useTriggerRun } from '@/data/useRuns'
import { Skeleton } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge, runStatusTone } from '@/components/Badge'
import { Button } from '@/components/Button'
import { useToast } from '@/components/feedback/Toast'
import { fmtDate, fmtNumber, titleCase } from '@/lib/format'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-hair py-3 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-1 text-sm text-fg">{value}</dd>
    </div>
  )
}

export function RunDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useRun(id)
  const trigger = useTriggerRun()
  const toast = useToast()

  const onRerun = () => {
    if (!data?.sourceId) return
    trigger.mutate(data.sourceId, {
      onSuccess: () =>
        toast.show({ type: 'success', message: `Queued a new run for ${data.sourceId}` }),
      onError: (e) =>
        toast.show({ type: 'error', message: e instanceof Error ? e.message : 'Failed to queue run' }),
    })
  }

  return (
    <div className="p-6 md:p-8">
      <button
        onClick={() => navigate('/runs')}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to runs
      </button>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full max-w-xl" />
        </div>
      )}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}
      {data === null && (
        <EmptyState title="Run not found" message={`No run with id ${id}.`} />
      )}

      {data && (
        <div className="max-w-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-fg">
                {titleCase(data.sourceId ?? data.service ?? 'Run')}
              </h1>
              <p className="mt-1 text-sm text-muted">Run {data.id}</p>
            </div>
            <Badge tone={runStatusTone(data.status)}>{data.status}</Badge>
          </div>

          <dl className="rounded-lg border border-hair bg-panel px-6 py-2">
            <Field label="When" value={fmtDate(data.timestamp)} />
            {data.sourceId && <Field label="Source" value={data.sourceId} />}
            {data.service && <Field label="Service" value={data.service} />}
            <Field label="Organizations ingested" value={fmtNumber(data.orgsIngested)} />
            <Field label="Signals ingested" value={fmtNumber(data.signalsIngested)} />
            {data.prospectsCount != null && (
              <Field label="Prospects" value={fmtNumber(data.prospectsCount)} />
            )}
            {data.snapshotId && <Field label="Snapshot" value={data.snapshotId} />}
            {data.error && (
              <Field
                label="Error"
                value={<span className="text-danger">{data.error}</span>}
              />
            )}
          </dl>

          {data.sourceId && (
            <Button
              variant="secondary"
              className="mt-6 inline-flex items-center gap-2"
              onClick={onRerun}
              disabled={trigger.isPending}
            >
              <RefreshCw className="h-4 w-4" />
              {trigger.isPending ? 'Queuing…' : 'Re-run this source'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
