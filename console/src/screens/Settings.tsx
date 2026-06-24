import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthProvider'
import { useSettings, useSaveSettings } from '@/data/useSettings'
import { SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/feedback/Toast'
import { DEFAULT_SETTINGS, type ConsoleSettings } from '@/data/types'

export function Settings() {
  const { user } = useAuth()
  const { data, isLoading, isError, error, refetch } = useSettings()
  const saveSettings = useSaveSettings()
  const toast = useToast()
  const qc = useQueryClient()

  const [form, setForm] = useState<ConsoleSettings>(DEFAULT_SETTINGS)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const set = (patch: Partial<ConsoleSettings>) =>
    setForm((prev) => ({ ...prev, ...patch }))

  const clampScore = (raw: string): number => {
    const n = Number(raw)
    if (Number.isNaN(n)) return 0
    return Math.min(100, Math.max(0, Math.round(n)))
  }

  const onSave = () => {
    saveSettings.mutate(form, {
      onSuccess: () => toast.show({ type: 'success', message: 'Settings saved' }),
      onError: (e) =>
        toast.show({ type: 'error', message: e instanceof Error ? e.message : 'Save failed' }),
    })
  }

  const onClearCache = () => {
    qc.clear()
    setConfirmClear(false)
    toast.show({ type: 'success', message: 'Local cache cleared' })
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg">Settings</h1>
        <p className="mt-2 text-muted">Manage your pipeline configuration and preferences</p>
      </div>

      {isLoading && <div className="max-w-2xl"><SkeletonRows rows={3} /></div>}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data && (
        <div className="max-w-2xl space-y-6">
          {/* Account */}
          <section className="rounded-lg border border-hair bg-panel p-6">
            <h2 className="mb-4 text-lg font-semibold text-fg">Account</h2>
            <div className="space-y-4">
              <Field label="Email Address">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded border border-hair bg-card px-3 py-2 text-sm text-fg disabled:opacity-50"
                />
              </Field>
              {user?.displayName && (
                <Field label="Display Name">
                  <input
                    type="text"
                    value={user.displayName}
                    disabled
                    className="w-full rounded border border-hair bg-card px-3 py-2 text-sm text-fg disabled:opacity-50"
                  />
                </Field>
              )}
            </div>
          </section>

          {/* Pipeline */}
          <section className="rounded-lg border border-hair bg-panel p-6">
            <h2 className="mb-4 text-lg font-semibold text-fg">Pipeline Configuration</h2>
            <div className="space-y-4">
              <Checkbox
                checked={form.autoRunEnabled}
                onChange={(v) => set({ autoRunEnabled: v })}
                label="Enable automatic pipeline runs"
              />
              <Checkbox
                checked={form.emailOnFailure}
                onChange={(v) => set({ emailOnFailure: v })}
                label="Email notifications on failures"
              />
              <Checkbox
                checked={form.debugLogging}
                onChange={(v) => set({ debugLogging: v })}
                label="Enable debug logging"
              />
            </div>
          </section>

          {/* Scoring */}
          <section className="rounded-lg border border-hair bg-panel p-6">
            <h2 className="mb-4 text-lg font-semibold text-fg">Scoring Configuration</h2>
            <div className="space-y-4">
              <Field label="Minimum Relevance Score (0–100)">
                <input
                  type="number"
                  value={form.minRelevanceScore}
                  min={0}
                  max={100}
                  onChange={(e) => set({ minRelevanceScore: clampScore(e.target.value) })}
                  className="w-full rounded border border-hair bg-card px-3 py-2 text-sm text-fg"
                />
              </Field>
              <Field label="Minimum Fit Score (0–100)">
                <input
                  type="number"
                  value={form.minFitScore}
                  min={0}
                  max={100}
                  onChange={(e) => set({ minFitScore: clampScore(e.target.value) })}
                  className="w-full rounded border border-hair bg-card px-3 py-2 text-sm text-fg"
                />
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={onSave} disabled={saveSettings.isPending}>
                {saveSettings.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </section>

          {/* Danger */}
          <section className="rounded-lg border border-danger/30 bg-danger/5 p-6">
            <h2 className="mb-2 text-lg font-semibold text-danger">Danger Zone</h2>
            <p className="mb-4 text-sm text-muted">
              Clear locally cached data. This does not affect stored records.
            </p>
            <Button variant="danger" onClick={() => setConfirmClear(true)}>
              Clear All Cache
            </Button>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear all cache?"
        message="This clears the console’s in-memory query cache and re-fetches data. No stored records are deleted."
        confirmLabel="Clear cache"
        destructive
        onConfirm={onClearCache}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-muted">{label}</label>
      {children}
    </div>
  )
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-hair"
      />
      <span className="ml-3 text-sm text-fg">{label}</span>
    </label>
  )
}
