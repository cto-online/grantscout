import { format } from 'date-fns'
import { Play, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export function PipelineRuns() {
  const runs = [
    {
      id: '1',
      source: 'ANBI Registry (Netherlands)',
      status: 'completed',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      recordsProcessed: 2341,
      recordsImported: 2341,
    },
    {
      id: '2',
      source: 'GrantAtlas Awardees',
      status: 'completed',
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000),
      recordsProcessed: 512,
      recordsImported: 501,
    },
    {
      id: '3',
      source: 'EU Grants',
      status: 'running',
      startedAt: new Date(Date.now() - 30 * 60 * 1000),
      recordsProcessed: 1234,
      recordsImported: 0,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'running':
        return <Clock className="h-5 w-5 text-info animate-spin" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-error" />
      default:
        return <Play className="h-5 w-5 text-muted" />
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">
          Pipeline Runs
        </h1>
        <p className="mt-2 text-muted">
          Monitor all data extraction and processing runs
        </p>
      </div>

      <div className="rounded-lg border border-hair bg-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hair bg-card">
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Source
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Status
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Started
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Records
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.id}
                className="border-b border-hair hover:bg-card transition-colors last:border-0"
              >
                <td className="px-6 py-4 text-fg font-medium">
                  {run.source}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    <span className="capitalize text-muted">
                      {run.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted">
                  {format(run.startedAt, 'MMM d, HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <div className="text-fg font-medium">
                    {run.recordsImported} / {run.recordsProcessed}
                  </div>
                  <div className="text-xs text-faint">
                    {Math.round((run.recordsImported / run.recordsProcessed) * 100)}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-accent hover:text-accent-hover font-medium text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
