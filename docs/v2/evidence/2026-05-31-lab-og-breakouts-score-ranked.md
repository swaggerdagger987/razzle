# Evidence — Breakouts OG RBS-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Slice:** Breakouts OG export ranks top-6 by breakout score

## Changes

- `BreakoutsRenderer.tsx` — `ogSnapshotRows` sorts by `rbs_score` (or formula score when active) before slice; position filter unchanged on export link

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&position=WR'
# 200 61718
file /tmp/og-breakouts.png   # PNG 1200x630
```

## Verdict

**PASS** — Gate C2: PNG ≥40KB with position param.
