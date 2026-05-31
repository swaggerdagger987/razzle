# Evidence — Breakouts OG RBS-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Cycle:** 94

## Change

`BreakoutsRenderer.tsx` — sort `ogSnapshotRows` by RBS/formula score before top-6 slice.

## Verification

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&position=WR'
# 200 61718
```

**PASS** — Gate C2.
