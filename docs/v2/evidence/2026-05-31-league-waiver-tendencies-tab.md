# Evidence — League L5 Bureau Waiver Tendencies tab

**Date:** 2026-05-31  
**Slice:** `league-waiver-tendencies-tab`  
**Atom:** Hawkeye waiver archetype grid unhidden in Bureau nav

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS — Next.js build completed |
| `pytest apps/api/tests -q` | PASS — 51 passed |
| waiver not in `HIDDEN_BUREAU_SLUGS` | PASS — only `strength-of-schedule` remains hidden |

## Gate C

N/A — no OG/share route changes this cycle.

## Reality

PASS — `BureauWaiverTendencies` renders API `rows` with Hawkeye header, archetype cards, and Room hallway links.
