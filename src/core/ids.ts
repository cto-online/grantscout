import { createHash } from 'crypto';

export function organizationId(country: string, normalizedNameOrId: string): string {
  const input = `${country}::${normalizedNameOrId}`;
  const hash = createHash('sha256').update(input).digest('hex');
  return hash.slice(0, 20);
}

export function signalId(orgId: string, type: string, occurredAt: string, sourceId: string): string {
  const input = `${orgId}::${type}::${occurredAt}::${sourceId}`;
  const hash = createHash('sha256').update(input).digest('hex');
  return hash.slice(0, 20);
}
