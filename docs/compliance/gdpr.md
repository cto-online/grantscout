# GDPR / AVG Compliance

GrantScout handles data about **organizations**, not individuals, and is built so
compliance is structural rather than bolted on. AVG is the Dutch implementation
of the GDPR.

## Guardrails

| Principle | How GrantScout enforces it |
|---|---|
| **Data minimization** | Org-level data only; no personal data is the design intent. |
| **Lawful basis** | Legitimate interest (B2B prospecting). |
| **Provenance** | Every record stamped with source, snapshot, and fetch time. |
| **Confidence** | Per-field confidence enables quality/trust decisions. |
| **Opt-out** | `organizations.optedOut` suppresses an org everywhere. |
| **No web tracking** | Public records + consented first-party (GrantAtlas) only. |
| **Retention** | Raw snapshots auto-delete after 7 days (GCS lifecycle). |

## Provenance = audit trail

Every `Organization` carries an array of `Provenance` and every `Signal` a single
`Provenance` (`{ sourceId, snapshotId, sourceUrl, fetchedAt, extractionMethod }`).
This makes data lineage answerable: for any record you can say *which source,
which snapshot, when*. See [Data Model](../architecture/data-model.md).

```bash
# audit ingestion events by provenance
gcloud logging read 'resource.type=firestore_database AND jsonPayload.provenance' \
  --format=json | jq '.[] | {timestamp, sourceId: .jsonPayload.provenance.sourceId}'
```

## Opt-out, enforced everywhere

`optedOut=true` is honored at multiple layers, so suppression is not a single
point of failure:

1. **Scorer** breaks the signal loop and forces `score = 0`, `tier = low`
   (`src/scoring/accountScore.ts`).
2. **Console** filters/labels opted-out orgs.
3. **Orchestrator** ranking surfaces low-tier orgs last (and won't promote them).

To process an opt-out, set `optedOut=true` on the org document; the next score
write reflects it (or run `scripts/rescore.ts`).

## Data minimization in practice

- Raw fetch snapshots are immutable and short-lived (7-day GCS lifecycle).
- Only fields needed for fit/intent scoring are persisted on the golden record.
- Review the raw bucket periodically:

```bash
gsutil ls -h gs://PROJECT-grantscout-raw/raw/
```

## Source ethics

Sources declare an `acquisitionTier`, `license`, and (for scrape tier) a
`robotsPolicy`. GrantScout uses **public-record + consented first-party** data
only and respects robots policies. New sources must document their basis — see
[Adding a Source](../sources/adding-a-source.md) and
[Sources → Overview](../sources/overview.md).

## Data-subject considerations

Because the system targets organizations, individual personal data is out of
scope by design. If a future signal touches personal data (e.g. a named contact
for reachability), it must be re-assessed against the lawful basis, minimization,
and retention principles above before shipping — and likely gated behind explicit
review.

## Compliance checklist for changes

- [ ] New data is org-level, not personal (or explicitly justified + reviewed)
- [ ] Provenance stamped on every new record
- [ ] Confidence set appropriately
- [ ] Opt-out still suppresses the new data path
- [ ] Retention/lifecycle considered for any new stored artifact
- [ ] Source license + robots policy documented
