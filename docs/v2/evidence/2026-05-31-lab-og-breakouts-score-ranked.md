# Evidence — Lab L5 breakouts OG RBS-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Route:** `/og/breakouts?download=1`

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test pytest apps/api/tests -q   # 51 passed, 5 skipped
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1'
```

## Result

- HTTP 200, **60649** bytes PNG (1200×630)
- `BreakoutsRenderer` sorts by `rbs_score` / formula score before `ogSnapshotRows` slice

## Verdict

PASS — FACTORY-DOD Gate C2 (≥40KB, real rows on card)
