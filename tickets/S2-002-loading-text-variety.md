---
id: S2-002
severity: S2
category: design
title: "Loading text 'pulling film...' overused across 38 of 51 pages"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S2-002: Loading text inconsistency — "pulling film..." overused

## Finding

Most pages use "pulling film..." as loading text, defeating the purpose of personality-driven loading states.

## Root Cause Investigation

Distribution across all HTML files:
- **"pulling film..."**: 38 pages (74% — overused)
- **"scouting..."** variants: 9 pages (breakouts, prospects, redzone, schedule, team, etc.)
- **"running the numbers..."**: 3 pages (efficiency, scarcity, snapefficiency)
- **"checking the tape..."**: 1 page (consistency)
- **Generic "Loading..."**: 0 pages (all use branded text)

No generic "Loading..." exists — all pages use branded text, which is good. But 38 pages sharing "pulling film..." makes the personality feel templated.

## Fix

Assign unique loading text per page context:
- Trade pages: "reviewing the tape room..."
- Matchup pages: "scouting the defense..."
- Aging/career pages: "pulling the career film..."
- Efficiency pages: "crunching the per-snap data..."
- Weekly pages: "rewinding the game tape..."
- Award pages: "counting the votes..."

## Impact

Minor design personality issue. DESIGN.md says loading states should have personality — having them all identical defeats the purpose.

## Acceptance Criteria

- [ ] No more than 5 pages share the same loading text
- [ ] Each page's loading text is contextually relevant to its content
