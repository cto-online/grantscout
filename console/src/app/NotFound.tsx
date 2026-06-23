import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/states/EmptyState'

export function NotFound() {
  return (
    <div className="p-8">
      <EmptyState
        icon={Compass}
        title="Page not found"
        message="That route doesn’t exist in the console."
        action={
          <Link
            to="/"
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-fg hover:bg-accent-hover"
          >
            Back to Overview
          </Link>
        }
      />
    </div>
  )
}
