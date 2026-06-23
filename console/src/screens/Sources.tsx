import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

export function Sources() {
  const sources = [
    {
      id: '1',
      name: 'ANBI Registry',
      provider: 'Netherlands',
      enabled: true,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'healthy',
    },
    {
      id: '2',
      name: 'GrantAtlas Awardees',
      provider: 'EU',
      enabled: true,
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'healthy',
    },
    {
      id: '3',
      name: 'EU Grants',
      provider: 'European Commission',
      enabled: true,
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'warning',
    },
    {
      id: '4',
      name: 'Foundation Center',
      provider: 'United States',
      enabled: false,
      lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'inactive',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />
      default:
        return <Clock className="h-5 w-5 text-muted" />
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">
          Data Sources
        </h1>
        <p className="mt-2 text-muted">
          Manage and monitor data extraction sources
        </p>
      </div>

      <div className="space-y-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between rounded-lg border border-hair bg-panel p-6 hover:border-accent/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {getStatusIcon(source.status)}
                <div>
                  <h3 className="font-semibold text-fg">
                    {source.name}
                  </h3>
                  <p className="text-sm text-muted">
                    {source.provider}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-muted">
                  {source.enabled ? 'Enabled' : 'Disabled'}
                </div>
                <p className="text-xs text-faint">
                  Last run: {Math.floor(
                    (Date.now() - source.lastRun.getTime()) / 60000
                  )}{' '}
                  min ago
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded px-3 py-2 text-sm font-medium text-accent hover:bg-accent-soft transition-colors">
                  Edit
                </button>
                <button className="rounded px-3 py-2 text-sm font-medium text-accent hover:bg-accent-soft transition-colors">
                  {source.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
