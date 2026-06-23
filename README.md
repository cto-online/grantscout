# GrantScout

Internal demand-side intelligence for GrantMaster. Finds the right NGO organizations to
become GrantMaster customers and ranks them by Fit × Intent × Timing × Reachability.

Mirror of GrantAtlas (which maps grants + funders); GrantScout maps the orgs that seek them.

## Modules
- **Sensor** — signal ingestion (ANBI, GrantAtlas awardees, hiring)
- **Scorer** — Account Score + canonical demand graph
- **Beacon** — feeds organic/viral acquisition loops (later phases)
- **Orchestrator** — ranks prospects → HubSpot / team

## Quick start
```bash
cp .env.example .env   # fill in
npm install
npm run pipeline:once -- --source anbi-nl
npm test
```

## Ethics & compliance
Public-record + consented first-party data only. GDPR/AVG legitimate-interest basis,
provenance on every record, frictionless opt-out (`organizations.optedOut`). No tracking
of individuals across the web. See the handoff doc §6.
