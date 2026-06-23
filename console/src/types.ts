export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
}

export interface PipelineRun {
  id: string
  source: string
  status: 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  recordsProcessed: number
  recordsImported: number
  error?: string
}

export interface Source {
  id: string
  name: string
  provider: string
  enabled: boolean
  lastRun?: PipelineRun
  nextScheduledRun?: Date
}

export interface ExtractedGrant {
  id: string
  title: string
  provider: string
  amount?: number
  deadline?: Date
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}
