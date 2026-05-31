# Evidence — Room L5 briefing copy export

**Cycle:** 129  
**Atom:** `room-briefing-copy-export`  
**Pillar:** Room  
**Layer:** L5

## Slice

Situation Room `BriefingCard` copies a Slack/Reddit-ready plain-text block (urgency, question, staff, body, follow-ups, room link).

## Acceptance

| Gate | Result |
|------|--------|
| `pytest apps/api/tests/test_briefing_export_format.py -q` | 2 passed |
| `npm run build --workspace=apps/web` | exit 0 |

## Files

- `apps/web/lib/format-briefing-export.ts` — `formatBriefingForExport`
- `apps/web/components/room/BriefingCard.tsx` — copy button
- `apps/api/tests/test_briefing_export_format.py` — structure checks

## Verdict

PASS — UI export path; no OG route this atom.
