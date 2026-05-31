# Evidence — lab-og-breakouts-score-ranked

**Date:** 2026-05-31  
**Atom:** Breakouts OG export ranks top-6 by RBS score  
**Verdict:** PASS

## Change

`BreakoutsRenderer` sorts `ogSnapshotRows` by `rbs_score` (or formula score) descending before slice(0, 6), matching Prospects RPS pattern.

## Gate C — OG curl

```text
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&position=WR&snapshot=...'
→ 200 61718
file: PNG 1200x630
```

## Build

`npm run build --workspace=apps/web` → exit 0
