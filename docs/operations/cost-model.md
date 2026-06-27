# Cost Model

GrantScout is designed to be **lean** — an NL-first deployment runs for roughly
**€1–8 / month**, well under the €10 target. Costs scale with volume, not with a
fixed server bill, because everything is serverless and scales to zero.

## Monthly estimate (NL-first)

| Component | Volume | Cost | Notes |
|---|---|---|---|
| GCS snapshots | ~1.5 GB/mo | €0.05 | 7-day retention |
| Firestore | ~3K docs, ~1K ops/day | €0.20 | Operations-dominated |
| Gemini embeddings | ~1K/day | €0.60 | ~€0.02 per 1K |
| Cloud Run | 3 jobs × ~5 min/day | €0.25 | CPU-seconds, scale-to-zero |
| **Total** | | **~€1.10–8** | Headroom under €10 |

Higher figures in the range account for real Gemini usage at production quota and
broader coverage; the low figure reflects light/offline-leaning operation.

## What drives cost

- **Gemini embeddings** — the largest variable. Each org mission is embedded for
  Fit. Mitigations: in-memory caching today (Redis is a documented future
  option), and the mock embedder when no key is set (free, offline).
- **Firestore operations** — reads/writes per run. Batched writes keep this low.
- **Cloud Run** — pay per CPU-second; jobs are short and scale to zero.
- **GCS** — small; a 7-day lifecycle policy auto-deletes raw snapshots.

## Controls

### Lifecycle policy (auto-delete raw snapshots)

```bash
cat > /tmp/lifecycle.json <<'EOF'
{ "lifecycle": { "rule": [ { "action": {"type": "Delete"}, "condition": {"age": 7} } ] } }
EOF
gsutil lifecycle set /tmp/lifecycle.json gs://PROJECT-grantscout-raw/
```

### Budget alert

```bash
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="GrantScout" \
  --budget-amount=50 \
  --threshold-rule=percent=50,percent=90,percent=100
```

### Usage monitoring

```bash
gsutil du -sh gs://PROJECT-grantscout-raw/         # storage
gcloud firestore databases describe --region=us-central1 | grep size
```

## Scaling expectations

Moving beyond NL (EU/world expansion, Phase 4) primarily increases org count →
more embeddings and Firestore ops. The architecture doesn't change; budget the
embedding line proportionally to org volume and consider a persistent embedding
cache before that growth. See the [roadmap](../reference/roadmap.md).
