import { config } from '../core/config.js';
import { createHash } from 'crypto';

/**
 * Simple in-memory embedding cache.
 * In production, use Redis or similar for distributed cache.
 */
const embeddingCache = new Map<string, number[]>();

const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const EMBED_DIM = Number(process.env.GEMINI_EMBED_DIM || 768);

/**
 * Call the Gemini embedding REST API (Google Generative Language).
 * Returns a dense embedding vector (EMBED_DIM elements).
 */
async function realGeminiEmbed(mission: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${config.geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text: mission }] },
      outputDimensionality: EMBED_DIM,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini embed ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { embedding?: { values?: number[] } };
  const values = json.embedding?.values;
  if (!values || values.length === 0) {
    throw new Error('Gemini embed: empty response');
  }
  return values;
}

/**
 * Generate an embedding for org mission text, used for Fit scoring
 * (mission ↔ ICP centroid similarity).
 *
 * Uses the real Gemini embedding API when GEMINI_API_KEY is configured;
 * otherwise (and on any API error) falls back to a deterministic keyword-based
 * mock so development and tests run offline.
 */
export async function embedMission(mission: string): Promise<number[]> {
  if (!mission) {
    return getMockEmbedding('');
  }

  const hash = createHash('sha256').update(mission).digest('hex');
  const cached = embeddingCache.get(hash);
  if (cached) return cached;

  let embedding: number[];
  if (config.geminiApiKey) {
    try {
      embedding = await realGeminiEmbed(mission);
    } catch (e) {
      console.warn(
        `[gemini] embedding failed, using keyword mock: ${(e as Error).message}`,
      );
      embedding = getMockEmbedding(mission);
    }
  } else {
    embedding = getMockEmbedding(mission);
  }

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

const GEN_MODEL = process.env.GEMINI_GEN_MODEL || 'gemini-flash-latest';

/**
 * Extract a concise mission/doelstelling for an org from scraped website text,
 * using the Gemini generation API. Returns undefined when no key, on API error,
 * or when the model can't determine a mission.
 */
export async function extractDoelstelling(
  orgName: string,
  pageText: string,
): Promise<string | undefined> {
  if (!config.geminiApiKey || !pageText.trim()) return undefined;
  const prompt =
    `Hieronder staat websitetekst van de Nederlandse goededoelenorganisatie "${orgName}". ` +
    `Geef in een bondige zin (in het Nederlands) de doelstelling/missie van de organisatie. ` +
    `Als de tekst geen duidelijke doelstelling bevat, antwoord exact: ONBEKEND.\n\nTekst:\n` +
    pageText.slice(0, 5000);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEN_MODEL}:generateContent?key=${config.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // thinkingBudget 0 so the token budget goes to the answer, not reasoning.
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 200,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text || /^onbekend/i.test(text)) return undefined;
    return text;
  } catch {
    return undefined;
  }
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
