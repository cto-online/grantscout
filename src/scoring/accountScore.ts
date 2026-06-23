import type { Organization, Signal, AccountScore, ScoreReason } from '../core/types.js';

// Base weight per signal type (intent contribution).
const SIGNAL_WEIGHTS: Record<string, number> = {
  search_intent: 1.0,
  hiring_grants_role: 0.9,
  grant_applied: 0.85,
  grant_awarded: 0.8,
  deadline_upcoming: 0.5,
  website_signal: 0.3,
  registry_listed: 0.2,
};

// Exponential recency decay; half-life in days.
function timingDecay(occurredAt: string, halfLifeDays = 30): number {
  const ageDays = (Date.now() - new Date(occurredAt).getTime()) / 86_400_000;
  return Math.max(0, Math.pow(0.5, ageDays / Math.max(1, halfLifeDays)));
}

function tierOf(score: number, fit: number): AccountScore['tier'] {
  if (score >= 70) return 'hot';
  if (score >= 45) return 'warm';
  if (fit >= 0.6) return 'cold_fit';
  return 'low';
}

/**
 * Composite Account Score.
 * @param fit          0..1 embedding similarity org.mission ↔ ICP centroid
 * @param reachability 0..1 can we reach the right person on an ethical channel
 */
export function computeAccountScore(
  org: Organization,
  signals: Signal[],
  fit: number,
  reachability: number,
  modelVersion = 'v0',
): AccountScore {
  const reasons: ScoreReason[] = [];
  const contributing: string[] = [];

  // Intent = max-weighted active signal (avoid double counting bursts).
  let intent = 0;
  // Timing = strongest recency among triggering signals.
  let timing = 0;

  for (const s of signals) {
    if (org.optedOut) break;
    const w = (SIGNAL_WEIGHTS[s.type] ?? 0) * (s.confidence.overall ?? 1);
    if (w > intent) intent = w;
    const decay = timingDecay(s.occurredAt);
    if (decay > timing && w >= 0.5) {
      timing = decay;
      reasons.push({
        factor: 'timing',
        detail: `${s.type} on ${s.occurredAt.slice(0, 10)}`,
        weight: decay,
        sourceId: s.provenance.sourceId,
      });
    }
    if (w >= 0.5) contributing.push(s.id);
  }

  if (fit > 0) reasons.push({ factor: 'fit', detail: `ICP similarity ${fit.toFixed(2)}`, weight: fit });
  if (intent > 0) reasons.push({ factor: 'intent', detail: `Top signal weight ${intent.toFixed(2)}`, weight: intent });

  // Composite: geometric-ish blend so a zero on any axis is heavily penalised,
  // but fit alone can still surface a "cold_fit" prospect.
  const raw = (0.40 * fit) + (0.30 * intent) + (0.20 * timing) + (0.10 * reachability);
  const score = org.optedOut ? 0 : Math.round(raw * 100);

  return {
    orgId: org.canonicalId,
    fit, intent, timing, reachability,
    score,
    tier: org.optedOut ? 'low' : tierOf(score, fit),
    reasons,
    contributingSignals: contributing,
    computedAt: new Date().toISOString(),
    modelVersion,
  };
}
