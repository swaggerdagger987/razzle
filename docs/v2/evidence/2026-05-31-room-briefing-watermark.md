# Evidence — Room briefing OG watermark + hallway (2026-05-31)

**Atom:** `room-briefing-watermark`  
**Epic:** Room L5 — briefing GTM export (atom 3/3)

## Changes

- `/og/briefing` watermark band uses `toRoom` deep link (`razzle.lol/room?...`) in terracotta band (Explore/H2H parity).
- `BriefingCard` adds copy link, preview card (no `download=1`), and export card.

## Verification

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_briefing_og_route.py -q` | 2 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| `curl /og/briefing?download=1` | `200 51866` PNG |
| `curl /og/briefing` (preview) | `200 32195` PNG |

**Verdict:** PASS — Gate C satisfied (PNG ≥40KB on export; preview shows watermark band).
