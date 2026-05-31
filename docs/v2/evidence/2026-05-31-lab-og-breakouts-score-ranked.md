# Evidence — Lab L5 breakouts OG RBS-ranked snapshot

**Atom:** `lab-og-breakouts-score-ranked`  
**Date:** 2026-05-31

## Change

`BreakoutsRenderer` sorts `candidates` by `rbs_score` (or `formula_score` when formula active) before encoding top-6 `ogSnapshotRows`.

## Gate C

```bash
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1'
file /tmp/og-breakouts.png
```

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/breakouts?download=1` | 200 | 60649 | PNG 1200×630 PASS |

## Tests

- `npm run build --workspace=apps/web` — exit 0
- `cd apps/api && python3 -m pytest tests -q --maxfail=1` — 51 passed
