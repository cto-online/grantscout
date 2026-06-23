import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Clock, FlaskConical } from 'lucide-react'
import { useLiveRuns } from '@/data/useRuns'
import { SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge, runStatusTone } from '@/components/Badge'
import { fmtRelative, fmtNumber, titleCase } from '@/lib/format'
import type { RunStatus } from '@/data/types'

const FILTERS: { label: string; value: RunStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Success', value: 'success' },
  { label: 'Running', value: 'running' },
  { label: 'Error', value: 'error' },
  { label: 'Dry-run', value: 'dry-run' },
]

function StatusIcon({ status }: { status: RunStatus }) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />
    case 'error':
      return <XCircle className="h-4 w-4 text-danger" />
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-accent" />
    case 'queued':
      return <Clock className="h-4 w-4 text-accent" />
    default:
      return <FlaskConical className="h-4 w-4 text-warning" />
  }
}

export function PipelineRuns() {
  const { data, isLoading, isError, error, retry } = useLiveRuns()
  const [filter, setFilter] = useState<RunStatus | 'all'>('all')
  const navigate = useNavigate()

  const runs = (data ?? []).filter((r) => filter === 'all' || r.status === filter)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-fg">Pipeline Runs</h1>
        <p className="mt-2 text-muted">Monitor all extraction runs across sources</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              filter === f.value
                ? 'bg-accent text-fg'
                : 'bg-card text-muted hover:bg-hair'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorState error={error} onRetry={retry} />}

      {data &&
        (runs.length === 0 ? (
          <EmptyState
            title="No runs match this filter"
            message="Try a different status filter."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-hair bg-panel">
            <table className="w-full text-sm">
              <thead className="border-b border-hair text-left text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Orgs</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Signals</th>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => navigate(`/runs/${run.id}`)}
                    className="cursor-pointer border-b border-hair last:border-0 hover:bg-card/50"
                  >
                    <td className="px-4 py-3 font-medium text-fg">
                      {titleCase(run.sourceId ?? run.service ?? 'run')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <StatusIcon status={run.status} />
                        <Badge tone={runStatusTone(run.status)}>{run.status}</Badge>
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted md:table-cell">
                      {fmtNumber(run.orgsIngested)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted md:table-cell">
                      {fmtNumber(run.signalsIngested)}
                    </td>
                    <td className="px-4 py-3 text-muted">{fmtRelative(run.timestamp)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-accent">View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  )
}
