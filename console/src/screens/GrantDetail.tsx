import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity } from 'lucide-react'
import { useGrantDetail } from '@/data/useGrants'
import { Skeleton } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge, tierTone, scoreTone } from '@/components/Badge'
import { fmtRelative, titleCase } from '@/lib/format'

const SCORE_BAR: Record<ReturnType<typeof scoreTone>, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-hair-strong',
  accent: 'bg-accent',
}

function Component({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-faint">{label}</span>
        <span className="text-muted">{pct}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-hair">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function GrantDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useGrantDetail(id)

  return (
    <div className="p-6 md:p-8">
      <button
        onClick={() => navigate('/grants')}
        className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to grants
      </button>

      {isLoading && (
        <div className="max-w-2xl space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}
      {data && !data.org && (
        <EmptyState title="Organization not found" message={`No organization with id ${id}.`} />
      )}

      {data?.org && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-fg">{data.org.names[0]}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="accent">{titleCase(data.org.type)}</Badge>
              <Badge>{data.org.country}</Badge>
              {data.org.sizeBand && <Badge>{titleCase(data.org.sizeBand)}</Badge>}
              {data.org.identifiers.anbi && <Badge tone="success">ANBI</Badge>}
            </div>
          </div>

          {data.org.mission && (
            <p className="text-sm text-muted">{data.org.mission}</p>
          )}

          {/* Score */}
          {data.score && (
            <div className="rounded-lg border border-hair bg-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-fg">Account Score</h2>
                <div className="flex items-center gap-3">
                  <Badge tone={tierTone(data.score.tier)}>{titleCase(data.score.tier)}</Badge>
                  <span className="text-2xl font-bold text-fg">{data.score.score}</span>
                </div>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-hair">
                <div
                  className={`h-full ${SCORE_BAR[scoreTone(data.score.score)]}`}
                  style={{ width: `${data.score.score}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Component label="Fit" value={data.score.fit} />
                <Component label="Intent" value={data.score.intent} />
                <Component label="Timing" value={data.score.timing} />
                <Component label="Reachability" value={data.score.reachability} />
              </div>
              {data.score.reasons.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-muted">
                  {data.score.reasons.map((r, i) => (
                    <li key={i}>
                      <span className="font-medium text-fg">{titleCase(r.factor)}:</span> {r.detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Signals */}
          <div className="rounded-lg border border-hair bg-panel p-6">
            <h2 className="mb-4 text-lg font-semibold text-fg">Signals</h2>
            {data.signals.length === 0 ? (
              <p className="text-sm text-faint">No signals recorded for this organization.</p>
            ) : (
              <ul className="space-y-2">
                {data.signals.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border-b border-hair pb-2 text-sm last:border-0"
                  >
                    <span className="flex items-center gap-2 text-fg">
                      <Activity className="h-4 w-4 text-accent" />
                      {titleCase(s.type)}
                    </span>
                    <span className="text-faint">{fmtRelative(s.occurredAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.org.themes && data.org.themes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.org.themes.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
