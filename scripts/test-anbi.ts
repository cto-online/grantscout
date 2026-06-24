/**
 * Test ANBI extraction with sample data (run with tsx scripts/test-anbi.ts)
 */
import { extractAnbi } from '../src/pipeline/extractors/anbi.js';
import { normalizeOrg, normalizeSignal } from '../src/pipeline/normalizer.js';
import { computeAccountScore } from '../src/scoring/accountScore.js';

// Simple in-memory resolver for testing (no Firestore)
async function resolveOrganizations(orgs: any[]) {
  return new Map(orgs.map(o => [o.canonicalId, o]));
}

function deduplicateSignals(signals: any[]) {
  const seen = new Set<string>();
  return signals.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

const sampleAnbiData = `RSIN_Nummer	Naam	Doelstelling	Status
816064877	Stichting Miljeudefensie	Bescherming van het milieu	Actief
517341022	Rode Kruis Afdeling Amsterdam	Hulpverlening aan kwetsbaren	Actief
855718281	Stichting Openbaar Belang	Maatschappelijke betrokkenheid	Actief`;

async function main() {
  console.log('=== GrantScout ANBI Test Pipeline ===\n');

  // 1. Extract
  console.log('1. Extracting from sample ANBI data...');
  const { orgs: extractedOrgs, signals: extractedSignals } = extractAnbi(sampleAnbiData, 'test-snapshot');

  console.log(`   Extracted: ${extractedOrgs.length} orgs, ${extractedSignals.length} signals\n`);

  // 2. Normalize
  console.log('2. Normalizing...');
  const normalizedOrgs = extractedOrgs.map(o => {
    const { org, errors } = normalizeOrg(o);
    if (errors.length > 0) console.warn(`   Errors for ${o.names[0]}:`, errors);
    return org;
  }).filter(Boolean);

  const normalizedSignals = extractedSignals.map(s => {
    const { signal, errors } = normalizeSignal(s);
    if (errors.length > 0) console.warn(`   Signal errors:`, errors);
    return signal;
  }).filter(Boolean);

  console.log(`   Normalized: ${normalizedOrgs.length} orgs, ${normalizedSignals.length} signals\n`);

  // 3. Resolve
  console.log('3. Resolving (dedup, merge provenance)...');
  const resolved = await resolveOrganizations(normalizedOrgs);
  const deduped = await deduplicateSignals(normalizedSignals);

  console.log(`   Resolved to: ${resolved.size} unique orgs, ${deduped.length} signals\n`);

  // 4. Score
  console.log('4. Computing Account Scores...');
  for (const org of resolved.values()) {
    const relatedSignals = deduped.filter(s => s.orgId === org.canonicalId);
    const score = computeAccountScore(org, relatedSignals, 0.5, 0.8);

    console.log(`\n   Org: ${org.names[0]}`);
    console.log(`   RSIN: ${org.identifiers.rsin}`);
    console.log(`   Score: ${score.score}/100 (${score.tier})`);
    console.log(`   Fit: ${score.fit.toFixed(2)}, Intent: ${score.intent.toFixed(2)}, Timing: ${score.timing.toFixed(2)}`);
    console.log(`   Reasons: ${score.reasons.map(r => r.detail).join('; ')}`);
  }

  console.log('\n✓ Pipeline test complete');
}

main().catch(console.error);
