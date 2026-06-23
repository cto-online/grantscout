import { useState } from 'react'
import { CheckCircle, AlertCircle, Clock, Plus } from 'lucide-react'
import { useSources, useToggleSource, useSaveSource } from '@/data/useSources'
import { SkeletonRows } from '@/components/states/Skeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { useToast } from '@/components/feedback/Toast'
import { fmtRelative } from '@/lib/format'
import type {
  Source,
  RunStatus,
  FetchProvider,
  AcquisitionTier,
  ExtractionMethod,
} from '@/data/types'

const PROVIDERS: FetchProvider[] = ['http', 'firecrawl', 'apify', 'grantatlas']
const TIERS: AcquisitionTier[] = ['api', 'feed', 'scrape', 'internal']
const METHODS: ExtractionMethod[] = ['deterministic', 'llm']

function StatusIcon({ status }: { status?: RunStatus }) {
  if (status === 'success') return <CheckCircle className="h-5 w-5 text-success" />
  if (status === 'error') return <AlertCircle className="h-5 w-5 text-danger" />
  return <Clock className="h-5 w-5 text-faint" />
}

const blankSource: Source = {
  id: '',
  name: '',
  country: 'NL',
  acquisitionTier: 'feed',
  extractionMethod: 'deterministic',
  provider: 'http',
  signalTypes: [],
  schedule: '',
  enabled: true,
}

export function Sources() {
  const { data, isLoading, isError, error, refetch } = useSources()
  const toggle = useToggleSource()
  const save = useSaveSource()
  const toast = useToast()
  const [editing, setEditing] = useState<Source | null>(null)
  const [isNew, setIsNew] = useState(false)

  const openEdit = (s: Source) => {
    setIsNew(false)
    setEditing(s)
  }
  const openNew = () => {
    setIsNew(true)
    setEditing({ ...blankSource })
  }

  const onToggle = (s: Source) =>
    toggle.mutate(
      { id: s.id, enabled: !s.enabled },
      {
        onError: (e) =>
          toast.show({ type: 'error', message: e instanceof Error ? e.message : 'Toggle failed' }),
      },
    )

  const onSave = () => {
    if (!editing) return
    if (!editing.id.trim() || !editing.name.trim()) {
      toast.show({ type: 'error', message: 'ID and name are required' })
      return
    }
    save.mutate(editing, {
      onSuccess: () => {
        toast.show({ type: 'success', message: `Saved ${editing.name}` })
        setEditing(null)
      },
      onError: (e) =>
        toast.show({ type: 'error', message: e instanceof Error ? e.message : 'Save failed' }),
    })
  }

  const set = (patch: Partial<Source>) =>
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev))

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-fg">Data Sources</h1>
          <p className="mt-2 text-muted">Manage and monitor data extraction sources</p>
        </div>
        <Button onClick={openNew} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add source
        </Button>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data &&
        (data.length === 0 ? (
          <EmptyState
            title="No sources configured"
            message="Add a data source to start ingesting organizations."
            action={<Button onClick={openNew}>Add source</Button>}
          />
        ) : (
          <div className="space-y-4">
            {data.map((source) => (
              <div
                key={source.id}
                className="flex flex-col gap-4 rounded-lg border border-hair bg-panel p-6 transition-colors hover:border-accent/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon status={source.lastRunStatus} />
                  <div>
                    <h3 className="font-semibold text-fg">{source.name}</h3>
                    <p className="text-sm text-muted">
                      {source.provider} · {source.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={source.enabled ? 'text-sm text-success' : 'text-sm text-faint'}>
                      {source.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <p className="text-xs text-faint">
                      Last run: {fmtRelative(source.lastRunAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(source)}
                      className="rounded px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onToggle(source)}
                      disabled={toggle.isPending}
                      className="rounded px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-50"
                    >
                      {source.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? 'Add source' : `Edit ${editing?.name ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={save.isPending}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4 text-sm">
            <Labelled label="ID">
              <input
                value={editing.id}
                disabled={!isNew}
                onChange={(e) => set({ id: e.target.value })}
                placeholder="anbi-nl"
                className="w-full rounded border border-hair bg-card px-3 py-2 text-fg disabled:opacity-50"
              />
            </Labelled>
            <Labelled label="Name">
              <input
                value={editing.name}
                onChange={(e) => set({ name: e.target.value })}
                className="w-full rounded border border-hair bg-card px-3 py-2 text-fg"
              />
            </Labelled>
            <div className="grid grid-cols-2 gap-3">
              <Labelled label="Provider">
                <Select
                  value={editing.provider}
                  options={PROVIDERS}
                  onChange={(v) => set({ provider: v as FetchProvider })}
                />
              </Labelled>
              <Labelled label="Country">
                <input
                  value={editing.country}
                  onChange={(e) => set({ country: e.target.value })}
                  className="w-full rounded border border-hair bg-card px-3 py-2 text-fg"
                />
              </Labelled>
              <Labelled label="Acquisition tier">
                <Select
                  value={editing.acquisitionTier}
                  options={TIERS}
                  onChange={(v) => set({ acquisitionTier: v as AcquisitionTier })}
                />
              </Labelled>
              <Labelled label="Extraction">
                <Select
                  value={editing.extractionMethod}
                  options={METHODS}
                  onChange={(v) => set({ extractionMethod: v as ExtractionMethod })}
                />
              </Labelled>
            </div>
            <Labelled label="Schedule (cron)">
              <input
                value={editing.schedule ?? ''}
                onChange={(e) => set({ schedule: e.target.value })}
                placeholder="0 3 * * 1"
                className="w-full rounded border border-hair bg-card px-3 py-2 text-fg"
              />
            </Labelled>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-hair bg-card px-3 py-2 text-fg"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
