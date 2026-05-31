# Evidence — League L5 Waiver Tendencies tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-waiver-tendencies-unhide` (epic atom 3/3)  
**Verdict:** PASS

## Changes

- Removed `waiver-tendencies` from `HIDDEN_BUREAU_SLUGS` (Schedule stays hidden).
- Added `BureauWaiverTendencies.tsx` — Hawkeye header, archetype cards, hallway links.
- Wired renderer in `BureauFeatureBody.tsx`.

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
grep waiver-tendencies apps/web/components/league/BureauFeatureBody.tsx  → match
```

## Gate C

N/A — no OG/share path in this atom.

## Reality

PASS — Bureau nav shows Waiver Tendencies; bespoke renderer replaces scaffold dump.
