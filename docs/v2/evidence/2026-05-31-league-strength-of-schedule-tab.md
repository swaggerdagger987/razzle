# Evidence — Bureau Strength of Schedule tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Slice:** Schedule tab unhidden with SOS matchup renderer

## Dedup

- `league-waiver-tendencies-tab` already merged on `razzle-v2-redesign` at `a2536dcc` — skipped rebuild.

## Changes

- `BureauStrengthOfSchedule.tsx` — Octo header, rank/PPG/opponent-avg stat cards, pace edge, verdict + Room link
- `BureauFeatureBody.tsx` — wire `strength-of-schedule`
- `bureau-features.ts` — `HIDDEN_BUREAU_SLUGS` empty (all Bureau tabs visible)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
```

## Verdict

**PASS** — Schedule tab visible; Bureau hidden-slug set empty; epic 3/3 complete.
