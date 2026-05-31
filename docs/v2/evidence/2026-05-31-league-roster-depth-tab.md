# Evidence — League L5 Bureau Roster Depth tab

**Date:** 2026-05-31  
**Atom:** `league-roster-depth-tab`  
**Verdict:** PASS

## Changes

- Removed `roster-depth` from `HIDDEN_BUREAU_SLUGS` in `apps/web/lib/bureau-features.ts`
- Added `BureauRosterDepth.tsx` — Dolphin header, position depth grades, Player Sheet clicks, hallway to film room
- Wired `BureauFeatureBody` for `roster-depth` feature slug

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
```

## Layer verification

- Bureau nav shows **Roster Depth** tab (Dolphin-owned section per `packages/agents/registry.ts`)
- Tab renders depth grades grid when API returns `depth` + `starters` payload
- Thin position blocks link to Dr. Dolphin in Room with `panelSlug: roster-depth`

## Trust

- T2 — League L5 Bureau depth visible in-product
- T5 — screenshot-worthy position grade cards
- T6 — hallway links preserve panel context
