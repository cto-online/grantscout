import { config } from '../core/config.js';
import { createHash } from 'crypto';

/**
 * Simple in-memory embedding cache.
 * In production, use Redis or similar for distributed cache.
 */
const embeddingCache = new Map<string, number[]>();

/**
 * Generate Gemini embedding for org mission text.
 * Used for Fit scoring (mission ↔ ICP centroid similarity).
 * For now, returns deterministic mock embedding based on mission keywords.
 * TODO: Replace with real Gemini embedding API when configured.
 */
export async function embedMission(mission: string): Promise<number[]> {
  if (!mission) {
    return getMockEmbedding('');
  }

  const hash = createHash('sha256').update(mission).digest('hex');
  if (embeddingCache.has(hash)) {
    return embeddingCache.get(hash)!;
  }

  // Mock embedding from keywords (deterministic for testing)
  const embedding = getMockEmbedding(mission);
  embeddingCache.set(hash, embedding);

  return embedding;
}

/**
 * Deterministic mock embedding for development/testing.
 * Based on mission keyword presence (real: call Gemini API).
 */
function getMockEmbedding(mission: string): number[] {
  const keywords = {
    env: ['environment', 'sustainability', 'climate', 'green', 'ecological'],
    health: ['health', 'medical', 'care', 'disease', 'disability', 'wellness'],
    education: ['education', 'learning', 'school', 'training', 'knowledge'],
    social: ['social', 'poverty', 'disadvantaged', 'marginalized', 'equity'],
    humanitarian: ['humanitarian', 'disaster', 'emergency', 'relief', 'crisis'],
  };

  // Simple vector: [env_score, health_score, education_score, social_score, humanitarian_score]
  const scores = {
    env: mission.toLowerCase().split(/\s+/).filter(w => keywords.env.some(k => w.includes(k))).length,
    health: mission.toLowerCase().split(/\s+/).filter(w => keywords.health.some(k => w.includes(k))).length,
    education: mission.toLowerCase().split(/\s+/).filter(w => keywords.education.some(k => w.includes(k))).length,
    social: mission.toLowerCase().split(/\s+/).filter(w => keywords.social.some(k => w.includes(k))).length,
    humanitarian: mission.toLowerCase().split(/\s+/).filter(w => keywords.humanitarian.some(k => w.includes(k))).length,
  };

  // Normalize to 0..1 range
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const normalized = Object.values(scores).map(s => (total > 0 ? s / Math.max(total, 1) : 0.2));

  return normalized;
}

/**
 * Compute cosine similarity between two embeddings.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  const minLen = Math.min(a.length, b.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Compute ICP centroid from seed org missions.
 * In production: compute from GrantMaster customer missions.
 */
export async function computeICPCentroid(seedMissions: string[]): Promise<number[]> {
  if (seedMissions.length === 0) {
    return getMockEmbedding('education social humanitarian');
  }

  const embeddings = await Promise.all(seedMissions.map(m => embedMission(m)));

  // Average embeddings
  const centroid: number[] = [];
  const dims = embeddings[0]?.length || 0;

  for (let i = 0; i < dims; i++) {
    const avg = embeddings.reduce((sum, emb) => sum + (emb[i] || 0), 0) / embeddings.length;
    centroid.push(avg);
  }

  return centroid;
}

/**
 * Compute Fit score: similarity between org embedding and ICP centroid.
 */
export async function computeFitScore(orgMission: string, icpCentroid: number[]): Promise<number> {
  const orgEmbedding = await embedMission(orgMission);
  return cosineSimilarity(orgEmbedding, icpCentroid);
}

/**
 * Structured extraction from unstructured content.
 * Used for long-tail sources (job posts, web content).
 * TODO: Implement with Gemini when configured.
 */
export async function extractStructured(content: string, context: Record<string, string>): Promise<Record<string, unknown>> {
  // TODO implement Gemini structured extraction
  // - Call Gemini API with structured output schema
  // - Handle: org name, country, signal type, confidence
  // - Timeout protection
  return {};
}
