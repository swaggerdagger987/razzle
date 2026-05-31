# Evidence — Room L5 briefing OG card

**Cycle:** 130  
**Atom:** `room-briefing-og-card`  
**Pillar:** Room  
**Layer:** L5

## Slice

`/og/briefing` renders a screenshot-ready Situation Room briefing card with demo rivalry readout; `BriefingCard` links `export card` when a briefing is complete.

## Acceptance

| Gate | Result |
|------|--------|
| `pytest apps/api/tests/test_briefing_og_route.py -q` | 2 passed |
| `pytest apps/api/tests/test_briefing_export_format.py -q` | 2 passed |
| `npm run build --workspace=apps/web` | exit 0 |
| Gate C curl | `200` PNG **68635** bytes (`/og/briefing?download=1`) |

## Files

- `apps/web/app/og/briefing/route.tsx` — OG ImageResponse + demo briefing
- `apps/web/components/room/BriefingCard.tsx` — export card + copy link
- `apps/web/lib/format-briefing-export.ts` — copy formatter (atom 1 dependency, not on base)
- `apps/api/tests/test_briefing_og_route.py` — structure checks

## Verdict

PASS — demo briefing layout on OG card; Room L5 GTM epic atom 2/3.
