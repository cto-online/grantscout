import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useScores } from '@/data/useScores'
import { SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge, tierTone, scoreTone } from '@/components/Badge'
import { titleCase } from '@/lib/format'
import type { AccountScore, Tier } from '@/data/types'

const TIERS: (Tier | 'all')[] = ['all', 'hot', 'warm', 'cold_fit', 'low']

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

function Row({ score }: { score: AccountScore }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-hair bg-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-faint" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-faint" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-fg">{score.orgName}</p>
        </div>
        <Badge tone={tierTone(score.tier)}>{titleCase(score.tier)}</Badge>
        <div className="flex w-40 items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-hair">
            <div
              className={`h-full ${SCORE_BAR[scoreTone(score.score)]}`}
              style={{ width: `${score.score}%` }}
            />
          </div>
          <span className="w-8 text-right text-lg font-bold text-fg">{score.score}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-hair p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Component label="Fit" value={score.fit} />
            <Component label="Intent" value={score.intent} />
            <Component label="Timing" value={score.timing} />
            <Component label="Reachability" value={score.reachability} />
          </div>
          {score.reasons.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-muted">
              {score.reasons.map((r, i) => (
                <li key={i}>
                  <span className="font-medium text-fg">{titleCase(r.factor)}:</span>{' '}
                  {r.detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function ScoringResults() {
  const { data, isLoading, isError, error, refetch } = useScores()
  const [tier, setTier] = useState<Tier | 'all'>('all')

  const rows = useMemo(
    () => (data ?? []).filter((s) => tier === 'all' || s.tier === tier),
    [data, tier],
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-fg">Scoring Results</h1>
        <p className="mt-2 text-muted">
          Fit × Intent × Timing × Reachability for each prospect
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              tier === t ? 'bg-accent text-fg' : 'bg-card text-muted hover:bg-hair'
            }`}
          >
            {t === 'all' ? 'All tiers' : titleCase(t)}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data &&
        (rows.length === 0 ? (
          <EmptyState
            title="No scores to show"
            message="Scores appear once the scoring engine has run."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((s) => (
              <Row key={s.id} score={s} />
            ))}
          </div>
        ))}
    </div>
  )
}
