# Evidence — League L5 Power Rankings tab

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-tab`  
**Slice:** Unhide Power Rankings tab with Octo renderer + hallway

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test pytest apps/api/tests -q` | 51 passed, 5 skipped |
| `power-rankings` not in `HIDDEN_BUREAU_SLUGS` | grep OK |
| Bureau API shape | service smoke: 2 rows, rank 1 by differential |

## UI claim

- Tab visible in Bureau nav (`VISIBLE_BUREAU_FEATURES` includes power-rankings).
- `BureauPowerRankings` renders Octo header, luck labels, hallway link to Room.

## Verdict

**PASS** — League L5 Bureau depth; no OG gate required this atom.
