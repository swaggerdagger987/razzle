# Evidence — Lab L5 Breakouts OG score-ranked snapshot

**Date:** 2026-05-31  
**Slice:** `lab-og-breakouts-score-ranked`  
**Cycle:** 94

## Acceptance

```text
npm run build --workspace=apps/web     → exit 0
breakouts og sorted by score           → PASS
```

## Changes

- `BreakoutsRenderer.tsx` — sort top-6 OG snapshot rows by RBS/breakout score before export

## Dedup notes

- Bureau Schedule tab already on base (`49eb4884` PR #430)
- Weekly PPG-ranked OG already on base in `WeeklyHeatmapRenderer`

## Verdict

PASS — breakouts export card shows highest breakout scores, not table order.
