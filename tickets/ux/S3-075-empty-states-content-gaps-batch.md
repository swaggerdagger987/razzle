---
id: S3-075
severity: S3
confidence: MEDIUM
category: ux-flow
source: DQ-102+104+105+108+109+290+273+240
status: OPEN
---

# Empty states and content gaps — 8 pages with barren or confusing defaults

## Root Cause

Multiple pages have unhelpful empty states or missing preview content:

1. **Compare page empty state barren** — `frontend/compare.html`: no players selected shows blank page with no guidance (DQ-102)
2. **Bureau pre-connect no preview** — `frontend/league-intel.html`: before Sleeper connection, no visual preview of what the Bureau offers (DQ-104)
3. **Home AI agents section no preview** — `frontend/index.html`: Situation Room section has no pixel canvas preview or animated demo (DQ-105)
4. **Rankings no tier grouping** — `frontend/rankings.html`: flat list with no visual hierarchy or tier breaks (DQ-108)
5. **Breakout cards no visual priority** — `frontend/breakouts.html`: grid of cards with no prioritization signal (DQ-109)
6. **No leagues empty state suggests bug** — `frontend/league-intel.html`: "not in any leagues" message doesn't clarify offseason context (DQ-290)
7. **Home bureau name used before introduced** — `frontend/index.html`: "Bureau of Intelligence" name used in copy before the feature is explained (DQ-273)
8. **Social proof section no actual proof** — `frontend/index.html`: social proof area has no real testimonials or user counts (DQ-240)

## Fix

Each page needs a designed empty state with:
- Illustration or preview screenshot
- Clear explanation of what the feature does
- CTA to get started

## Files

- `frontend/compare.html` — empty state
- `frontend/league-intel.html` — pre-connect and empty leagues
- `frontend/index.html` — demo, social proof, naming
- `frontend/rankings.html` — tier grouping
- `frontend/breakouts.html` — visual hierarchy

## Acceptance Criteria

- No page shows a blank/barren state without guidance
- Empty states include illustration and action prompt
- Bureau pre-connect shows preview screenshots
