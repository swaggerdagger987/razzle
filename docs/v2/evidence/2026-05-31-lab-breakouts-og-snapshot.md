# Evidence — Lab breakouts OG snapshot rows

**Cycle:** 83  
**Date:** 2026-05-31  
**Route:** `/og/breakouts`

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped

# Demo fallback (no snapshot)
curl -s -o /tmp/og-breakouts-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1'
# 200 60649

# Snapshot fixture (matches in-panel export encoding)
SNAP=W3sibiI6IkJyZWVjZSBIYWxsIiwicCI6IlJCIiwidCI6Ik5ZSiIsInMiOjg4LjUsInNsIjoiUkJTIn1d
curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}\n' \
  "http://127.0.0.1:3000/og/breakouts?download=1&snapshot=$SNAP"
# 200 40704
file /tmp/og-breakouts-snap.png  # PNG 1200x630
```

## Verdict

**PASS** — Gate C2/C3 satisfied. BreakoutsRenderer passes `snapshotRows` (top 6 candidates, RBS or formula score) into `LabOgExportLink`; OG route renders named rows from snapshot param.
