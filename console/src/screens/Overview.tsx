import { BarChart3, Database, Clock, CheckCircle } from 'lucide-react'

export function Overview() {
  const stats = [
    {
      label: 'Total Pipeline Runs',
      value: '24',
      change: '+2 this week',
      icon: BarChart3,
    },
    {
      label: 'Active Sources',
      value: '8',
      change: 'All connected',
      icon: Database,
    },
    {
      label: 'Pending Review',
      value: '12',
      change: '3 high priority',
      icon: Clock,
    },
    {
      label: 'Approved Grants',
      value: '156',
      change: '+8 this month',
      icon: CheckCircle,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Pipeline Overview
        </h1>
        <p className="mt-2 text-text-secondary">
          Monitor your grant discovery pipeline at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-hair bg-surface-primary p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-secondary">
                  {stat.label}
                </h3>
                <div className="rounded bg-accent/10 p-2">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="mb-2 text-3xl font-bold text-text-primary">
                {stat.value}
              </div>
              <p className="text-xs text-text-tertiary">{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="rounded-lg border border-hair bg-surface-primary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Recent Pipeline Runs
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-hair pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    ANBI Source Extraction
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Completed 2 hours ago
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-success">
                    ✓ Success
                  </div>
                  <p className="text-xs text-text-tertiary">
                    1,234 records imported
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
