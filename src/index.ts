import { SOURCES } from './sources/registry.js';
import { runSensor } from './pipeline/sensor.js';

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--source='))
    ?? process.argv[process.argv.indexOf('--source') + 1];
  const sourceId = arg?.replace('--source=', '');

  if (!sourceId) {
    console.log('Usage: npm run pipeline:once -- --source <source-id>');
    console.log('Available sources:');
    SOURCES.forEach(s => {
      console.log(`  ${s.id}: ${s.name} (${s.enabled ? 'enabled' : 'disabled'})`);
    });
    process.exit(1);
  }

  // Grants are a separate entity (opportunities catalog), not the org sensor.
  if (sourceId === 'grantatlas-grants') {
    const { ingestGrants } = await import('./sources/grantatlas/ingest.js');
    try {
      const res = await ingestGrants();
      console.log(`\n✓ GrantAtlas opportunities ingested: ${res.grants}`);
      return;
    } catch (error) {
      console.error('\n✗ GrantAtlas ingest failed:', error);
      process.exit(1);
    }
  }

  const source = SOURCES.find((s) => s.id === sourceId);
  if (!source) {
    console.error(`Unknown source: ${sourceId}. Known: ${SOURCES.map(s => s.id).join(', ')}`);
    process.exit(1);
  }

  if (!source.enabled) {
    console.warn(`⚠ Source ${sourceId} is disabled. Enable in src/sources/registry.ts`);
  }

  try {
    const res = await runSensor(source);
    console.log(`\n✓ Pipeline complete: ${res.orgs} orgs, ${res.signals} signals`);
  } catch (error) {
    console.error('\n✗ Pipeline failed:', error);
    process.exit(1);
  }
}

main();
