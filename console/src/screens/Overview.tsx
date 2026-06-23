import { BarChart3, Database, Clock, Building2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOverview } from '@/data/useOverview'
import { SkeletonCards, SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge, runStatusTone } from '@/components/Badge'
import { fmtRelative, fmtNumber, titleCase } from '@/lib/format'

export function Overview() {
  const { data, isLoading, isError, error, refetch } = useOverview()

  const stats: { label: string; value: string; icon: LucideIcon }[] = data
    ? [
        { label: 'Total Pipeline Runs', value: fmtNumber(data.totalRuns), icon: BarChart3 },
        { label: 'Active Sources', value: fmtNumber(data.activeSources), icon: Database },
        { label: 'Pending Review', value: fmtNumber(data.pendingReview), icon: Clock },
        { label: 'Organizations', value: fmtNumber(data.organizations), icon: Building2 },
      ]
    : []

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">Pipeline Overview</h1>
        <p className="mt-2 text-muted">
          Monitor your grant discovery pipeline at a glance
        </p>
      </div>

      {isLoading && (
        <>
          <SkeletonCards />
          <div className="mt-8">
            <SkeletonRows rows={4} />
          </div>
        </>
      )}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="rounded-lg border border-hair bg-panel p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted">{stat.label}</h3>
                    <div className="rounded bg-accent-soft p-2">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-fg">{stat.value}</div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-lg border border-hair bg-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Recent Pipeline Runs</h2>
              <Link to="/runs" className="text-sm font-medium text-accent hover:text-accent-hover">
                View all
              </Link>
            </div>
            {data.recentRuns.length === 0 ? (
              <EmptyState title="No runs yet" message="Pipeline runs will appear here once a source has been ingested." />
            ) : (
              <div className="space-y-3">
                {data.recentRuns.map((run) => (
                  <Link
                    key={run.id}
                    to={`/runs/${run.id}`}
                    className="flex items-center justify-between border-b border-hair pb-3 last:border-0 hover:opacity-80"
                  >
                    <div>
                      <p className="font-medium text-fg">
                        {titleCase(run.sourceId ?? run.service ?? 'run')}
                      </p>
                      <p className="text-xs text-faint">{fmtRelative(run.timestamp)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-faint sm:inline">
                        {fmtNumber(run.orgsIngested)} orgs
                      </span>
                      <Badge tone={runStatusTone(run.status)}>{run.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
