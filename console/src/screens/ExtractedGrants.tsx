import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export function ExtractedGrants() {
  const grants = [
    {
      id: '1',
      title: 'Research Innovation Fund 2024',
      provider: 'ANBI',
      amount: 250000,
      deadline: new Date('2024-12-31'),
      status: 'approved',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Environmental Impact Initiative',
      provider: 'EU Grants',
      amount: 500000,
      deadline: new Date('2024-11-30'),
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Community Development Program',
      provider: 'GrantAtlas',
      amount: 100000,
      deadline: new Date('2024-09-15'),
      status: 'rejected',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'pending':
        return <Clock className="h-5 w-5 text-info" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-error" />
      default:
        return null
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">
          Extracted Grants
        </h1>
        <p className="mt-2 text-muted">
          Review and manage extracted grant opportunities
        </p>
      </div>

      <div className="rounded-lg border border-hair bg-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hair bg-card">
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Title
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Provider
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Amount
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Deadline
              </th>
              <th className="px-6 py-3 text-left font-semibold text-fg">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {grants.map((grant) => (
              <tr
                key={grant.id}
                className="border-b border-hair hover:bg-card transition-colors last:border-0"
              >
                <td className="px-6 py-4 text-fg font-medium">
                  {grant.title}
                </td>
                <td className="px-6 py-4 text-muted">
                  {grant.provider}
                </td>
                <td className="px-6 py-4 text-fg font-medium">
                  €{(grant.amount / 1000).toFixed(0)}k
                </td>
                <td className="px-6 py-4 text-muted">
                  {format(grant.deadline, 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(grant.status)}
                    <span className="capitalize text-muted">
                      {grant.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
