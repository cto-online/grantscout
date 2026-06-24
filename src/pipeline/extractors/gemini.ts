import type { Organization, Signal } from '../../core/types.js';

/**
 * LLM-based extractor using Gemini for long-tail signals.
 * Fallback for unstructured sources (job posts, web content).
 */
export async function extractWithGemini(content: string, context: Record<string, string>): Promise<{
  orgs: Organization[];
  signals: Signal[];
}> {
  // TODO implement Gemini extraction
  // - Use Genkit + Gemini API
  // - Structured output: org name, country, signal type, confidence
  // - Handle: hiring posts (org name, role, match to grants domain)
  // - Confidence lower than deterministic (0.6-0.7 range)
  // - Cost-conscious: batch similar items, cache where possible
  return { orgs: [], signals: [] };
}
