---
id: S3-091
severity: S3
confidence: MEDIUM
category: ux-flow
source: DQ-102+104+105+107+108+109+113+166+288
status: OPEN
---

# Designer-ticket queue items — 6 remaining unkicketed findings from DQ queue

## Root Cause

Items from designer-tickets/queue/ not covered by other tickets:

1. **Compare page empty state barren** — `frontend/compare.html`: empty state offers no guidance when no players selected (DQ-102). Also tracked in S3-075 but deserves standalone note as it's the only queue P1 not covered.

2. **Bureau pre-connect no feature preview** — `frontend/league-intel.html`: before connecting Sleeper, users see blank content with no visual preview of Bureau features (DQ-104). Also in S3-075.

3. **Home AI agents no pixel canvas preview** — `frontend/index.html`: Situation Room marketing section has no live canvas demo or animated preview (DQ-105)

4. **Lab mobile 375px toolbar cramped** — `frontend/lab.html`: toolbar buttons overlap and become unreadable on small phones (DQ-107). Covered in S2-096.

5. **Rankings no tier grouping** — `frontend/rankings.html`: flat player list with no visual tier breaks or hierarchy signals (DQ-108)

6. **Breakout cards no visual priority** — `frontend/breakouts.html`: all breakout candidate cards have equal visual weight despite different scores (DQ-109)

Additional uncovered pending items:
7. **Empty th accessible name** — sitewide: `<th></th>` elements have no accessible content (DQ-113)
8. **Warroom event listeners no cleanup** — `frontend/warroom.js`: event listeners added without removal on component teardown (DQ-166)
9. **Sleeper API errors undifferentiated** — `frontend/league-intel.html`: all Sleeper API errors show the same generic message (DQ-288)

## Fix

Each item requires a targeted fix at the listed file location. Rankings tier grouping and breakout prioritization are the highest-impact UX items.

## Files

- `frontend/compare.html` — empty state
- `frontend/league-intel.html` — pre-connect preview, error differentiation
- `frontend/index.html` — canvas preview
- `frontend/rankings.html` — tier grouping
- `frontend/breakouts.html` — visual priority
- `frontend/warroom.js` — listener cleanup

## Acceptance Criteria

- Rankings shows visual tier breaks
- Breakout candidates sorted by visual hierarchy
- Sleeper errors distinguish network vs not-found vs rate-limit
