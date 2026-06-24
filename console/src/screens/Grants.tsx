import { useMemo, useState } from 'react'
import { ExternalLink, Banknote } from 'lucide-react'
import { useOpportunities } from '@/data/useOpportunities'
import { SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge, type BadgeTone } from '@/components/Badge'
import { fmtDate, titleCase } from '@/lib/format'
import type { GrantOpportunity } from '@/data/types'

const STATUSES = ['all', 'active', 'upcoming', 'closed', 'archived'] as const

function statusTone(status: string): BadgeTone {
  if (status === 'active') return 'success'
  if (status === 'upcoming') return 'accent'
  return 'neutral'
}

function fmtFunding(g: GrantOpportunity): string {
  const cur = g.currency === 'EUR' ? '€' : (g.currency ? g.currency + ' ' : '')
  const k = (n?: number) => (n == null ? '?' : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`)
  if (g.fundingMin == null && g.fundingMax == null) return '—'
  return `${cur}${k(g.fundingMin)}–${cur}${k(g.fundingMax)}`
}

function windowLabel(g: GrantOpportunity): string {
  if (g.rolling) return 'Rolling'
  if (g.dateClose) return `Closes ${fmtDate(g.dateClose)}`
  if (g.dateOpen) return `Opens ${fmtDate(g.dateOpen)}`
  return '—'
}

export function Grants() {
  const { data, isLoading, isError, error, refetch } = useOpportunities()
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all')

  const rows = useMemo(
    () => (data ?? []).filter((g) => status === 'all' || g.status === status),
    [data, status],
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-fg">Grants</h1>
        <p className="mt-2 text-muted">
          Funding opportunities from GrantAtlas — by funder, window and eligibility
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              status === s ? 'bg-accent text-fg' : 'bg-card text-muted hover:bg-hair'
            }`}
          >
            {s === 'all' ? 'All' : titleCase(s)}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data &&
        (rows.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="No opportunities"
            message="Grant opportunities from GrantAtlas will appear here once ingested."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((g) => (
              <div key={g.id} className="rounded-lg border border-hair bg-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-fg">{g.title}</h3>
                    <p className="mt-0.5 text-sm text-muted">
                      {g.funderName ?? g.funderId}
                      {g.grantType ? ` · ${titleCase(g.grantType)}` : ''}
                    </p>
                  </div>
                  <Badge tone={statusTone(g.status)}>{titleCase(g.status)}</Badge>
                </div>

                {g.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{g.description}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span className="font-medium text-fg">{fmtFunding(g)}</span>
                  <span className="text-muted">{windowLabel(g)}</span>
                  {g.ngoEligible && <Badge tone="success">NGO-eligible</Badge>}
                  {(g.sectors ?? []).slice(0, 3).map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                  {(g.geographicScope ?? []).slice(0, 2).map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                  {g.sourceUrl && (
                    <a
                      href={g.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-accent hover:text-accent-hover"
                    >
                      Source <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
