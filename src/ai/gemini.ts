import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config } from '../core/config.js';

const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash',
});

/**
 * Generate Gemini embedding for org mission text.
 * Used for Fit scoring (mission ↔ ICP centroid similarity).
 */
export async function embedMission(mission: string): Promise<number[]> {
  if (!mission || !config.geminiApiKey) {
    return [];
  }

  // TODO implement embedding call
  // - Call Gemini embedding API (text-embedding-004 or similar)
  // - Cache per unique mission hash
  // - Handle rate limits gracefully
  return [];
}

/**
 * Structured extraction from unstructured content.
 * Used for long-tail sources (job posts, web content).
 */
export async function extractStructured(content: string, context: Record<string, string>): Promise<Record<string, unknown>> {
  // TODO implement Gemini structured extraction
  // - Use genkit flow with Gemini + structured output
  // - Handle: org name, country, signal type, confidence
  // - Timeout protection
  return {};
}
