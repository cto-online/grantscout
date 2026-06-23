import { SOURCES } from './sources/registry.js';
import { runSensor } from './pipeline/sensor.js';

const arg = process.argv.find((a) => a.startsWith('--source='))
  ?? process.argv[process.argv.indexOf('--source') + 1];
const sourceId = arg?.replace('--source=', '');

const source = SOURCES.find((s) => s.id === sourceId);
if (!source) {
  console.error(`Unknown source: ${sourceId}. Known: ${SOURCES.map(s => s.id).join(', ')}`);
  process.exit(1);
}

const res = await runSensor(source);
console.log(`[grantscout] ${source.id}: ${res.orgs} orgs, ${res.signals} signals`);
