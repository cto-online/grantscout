import { Timestamp, type DocumentData } from 'firebase/firestore'
import type {
  Run,
  Organization,
  AccountScore,
  Source,
  ReviewItem,
  ConsoleSettings,
  SignalSummary,
} from './types'
import { DEFAULT_SETTINGS } from './types'

/**
 * Coerce any Firestore/JSON date representation into a JS Date.
 * Handles Firestore Timestamp, `{ seconds, nanoseconds }` plain objects,
 * ISO strings (the backend writes these), epoch numbers, and Date instances.
 */
export function tsToDate(value: unknown): Date | undefined {
  if (value == null) return undefined
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? undefined : d
  }
  if (typeof value === 'object' && 'seconds' in (value as Record<string, unknown>)) {
    const seconds = (value as { seconds: number }).seconds
    return new Date(seconds * 1000)
  }
  return undefined
}

export function toRun(id: string, d: DocumentData): Run {
  return {
    id,
    sourceId: d.sourceId,
    service: d.service,
    timestamp: tsToDate(d.timestamp) ?? new Date(0),
    orgsIngested: d.orgsIngested,
    signalsIngested: d.signalsIngested,
    prospectsCount: d.prospectsCount,
    snapshotId: d.snapshotId,
    status: d.status ?? 'success',
    error: d.error,
  }
}

export function toOrganization(id: string, d: DocumentData): Organization {
  return {
    canonicalId: d.canonicalId ?? id,
    names: Array.isArray(d.names) ? d.names : d.name ? [d.name] : [],
    type: d.type ?? 'other',
    country: d.country ?? '',
    identifiers: d.identifiers ?? {},
    mission: d.mission,
    themes: d.themes,
    sizeBand: d.sizeBand,
    geographicScope: d.geographicScope,
    optedOut: d.optedOut,
    createdAt: tsToDate(d.createdAt),
    updatedAt: tsToDate(d.updatedAt),
  }
}

export function toAccountScore(id: string, d: DocumentData): AccountScore {
  return {
    id,
    orgId: d.orgId ?? id,
    fit: d.fit ?? 0,
    intent: d.intent ?? 0,
    timing: d.timing ?? 0,
    reachability: d.reachability ?? 0,
    score: d.score ?? 0,
    tier: d.tier ?? 'low',
    reasons: Array.isArray(d.reasons) ? d.reasons : [],
    contributingSignals: Array.isArray(d.contributingSignals)
      ? d.contributingSignals
      : [],
    computedAt: tsToDate(d.computedAt),
    modelVersion: d.modelVersion,
  }
}

export function toSource(id: string, d: DocumentData): Source {
  return {
    id,
    name: d.name ?? id,
    country: d.country ?? '',
    acquisitionTier: d.acquisitionTier ?? 'feed',
    extractionMethod: d.extractionMethod ?? 'deterministic',
    provider: d.provider ?? 'http',
    signalTypes: Array.isArray(d.signalTypes) ? d.signalTypes : [],
    schedule: d.schedule,
    enabled: d.enabled ?? false,
    lastRunAt: tsToDate(d.lastRunAt),
    lastRunStatus: d.lastRunStatus,
  }
}

export function toReviewItem(id: string, d: DocumentData): ReviewItem {
  return {
    id,
    orgId: d.orgId,
    title: d.title ?? '(untitled)',
    priority: d.priority ?? 'medium',
    reason: d.reason ?? '',
    submittedBy: d.submittedBy ?? 'system',
    status: d.status ?? 'pending',
    createdAt: tsToDate(d.createdAt),
    reviewedBy: d.reviewedBy,
    reviewedAt: tsToDate(d.reviewedAt),
  }
}

export function toSignalSummary(id: string, d: DocumentData): SignalSummary {
  return {
    id,
    type: d.type ?? 'signal',
    occurredAt: tsToDate(d.occurredAt),
    strength: d.strength,
    sourceId: d.provenance?.sourceId ?? d.sourceId,
  }
}

export function toSettings(d: DocumentData | undefined): ConsoleSettings {
  if (!d) return { ...DEFAULT_SETTINGS }
  return {
    autoRunEnabled: d.autoRunEnabled ?? DEFAULT_SETTINGS.autoRunEnabled,
    emailOnFailure: d.emailOnFailure ?? DEFAULT_SETTINGS.emailOnFailure,
    debugLogging: d.debugLogging ?? DEFAULT_SETTINGS.debugLogging,
    minRelevanceScore: d.minRelevanceScore ?? DEFAULT_SETTINGS.minRelevanceScore,
    minFitScore: d.minFitScore ?? DEFAULT_SETTINGS.minFitScore,
    updatedAt: tsToDate(d.updatedAt),
    updatedBy: d.updatedBy,
  }
}
