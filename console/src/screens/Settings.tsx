import { useAuth } from '@/auth/AuthProvider'

export function Settings() {
  const { user } = useAuth()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="mt-2 text-text-secondary">
          Manage your pipeline configuration and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account Section */}
        <div className="rounded-lg border border-hair bg-surface-primary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded border border-hair bg-surface-secondary px-3 py-2 text-sm text-text-primary disabled:opacity-50"
              />
            </div>
            {user?.displayName && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={user.displayName}
                  disabled
                  className="w-full rounded border border-hair bg-surface-secondary px-3 py-2 text-sm text-text-primary disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Configuration */}
        <div className="rounded-lg border border-hair bg-surface-primary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Pipeline Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-hair"
                />
                <span className="ml-3 text-sm text-text-primary">
                  Enable automatic pipeline runs
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-hair"
                />
                <span className="ml-3 text-sm text-text-primary">
                  Email notifications on failures
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-hair"
                />
                <span className="ml-3 text-sm text-text-primary">
                  Enable debug logging
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Scoring Configuration */}
        <div className="rounded-lg border border-hair bg-surface-primary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Scoring Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Minimum Relevance Score
              </label>
              <input
                type="number"
                defaultValue={70}
                min={0}
                max={100}
                className="w-full rounded border border-hair bg-surface-secondary px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Minimum Fit Score
              </label>
              <input
                type="number"
                defaultValue={75}
                min={0}
                max={100}
                className="w-full rounded border border-hair bg-surface-secondary px-3 py-2 text-sm text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-error/30 bg-error/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-error">
            Danger Zone
          </h2>
          <button className="rounded bg-error px-4 py-2 font-medium text-text-inverted hover:bg-error/90">
            Clear All Cache
          </button>
        </div>
      </div>
    </div>
  )
}
