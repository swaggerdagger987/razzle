# Evidence — League L5 Roster Depth tab unhidden

**Date:** 2026-05-31  
**Slice:** `league-roster-depth-tab` — Unhide Roster Depth tab with Dolphin renderer  
**Verdict:** PASS (non-OG Bureau tab — Gate C N/A)

## Changes

- Removed `roster-depth` from `HIDDEN_BUREAU_SLUGS` in `apps/web/lib/bureau-features.ts`
- Added `BureauRosterDepth.tsx` — Dolphin header, A–F position grades, top-6 dynasty-sorted players per position, Player Sheet clicks, thin-depth → Room ask
- Wired `BureauFeatureBody` for `roster-depth` slug

## Commands (executed)

```text
JWT_SECRET=test python3 -m pytest apps/api/tests -q
→ 51 passed, 5 skipped

npm run build --workspace=apps/web
→ success; /league/[id]/[feature] bundle includes roster-depth route
```

## Manual check

- Nav shows **Roster Depth** when Sleeper user connected
- `/league/{id}/roster-depth` POSTs `/api/bureau/roster-depth` and renders Dolphin depth board (requires live league + user in dev)
