import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useOrganizations } from '@/data/useOrganizations'
import { SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Badge } from '@/components/Badge'
import { fmtRelative, titleCase } from '@/lib/format'
import type { OrgType } from '@/data/types'

const TYPES: (OrgType | 'all')[] = [
  'all',
  'ngo',
  'foundation',
  'charity',
  'association',
  'social_enterprise',
]

export function Organizations() {
  const { data, isLoading, isError, error, refetch } = useOrganizations()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState<OrgType | 'all'>('all')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (data ?? []).filter((o) => {
      if (type !== 'all' && o.type !== type) return false
      if (!needle) return true
      return (
        o.names.some((n) => n.toLowerCase().includes(needle)) ||
        (o.mission ?? '').toLowerCase().includes(needle) ||
        (o.themes ?? []).some((t) => t.toLowerCase().includes(needle))
      )
    })
  }, [data, q, type])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-fg">Organizations</h1>
        <p className="mt-2 text-muted">
          NGO organizations extracted from connected sources
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, mission or theme…"
            className="w-full rounded border border-hair bg-card py-2 pl-9 pr-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as OrgType | 'all')}
          className="rounded border border-hair bg-card px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t === 'all' ? 'All types' : titleCase(t)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data &&
        (rows.length === 0 ? (
          <EmptyState
            title="No organizations found"
            message={q || type !== 'all' ? 'Try clearing your filters.' : 'Run a source to extract organizations.'}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-hair bg-panel">
            <table className="w-full text-sm">
              <thead className="border-b border-hair text-left text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Themes</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">ANBI</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr
                    key={o.canonicalId}
                    onClick={() => navigate(`/organizations/${o.canonicalId}`)}
                    className="cursor-pointer border-b border-hair last:border-0 hover:bg-card/50"
                  >
                    <td className="px-4 py-3 font-medium text-fg">{o.names[0]}</td>
                    <td className="px-4 py-3 text-muted">{titleCase(o.type)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="flex flex-wrap gap-1">
                        {(o.themes ?? []).slice(0, 3).map((t) => (
                          <Badge key={t}>{t}</Badge>
                        ))}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {o.identifiers.anbi ? (
                        <Badge tone="success">ANBI</Badge>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{fmtRelative(o.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  )
}
