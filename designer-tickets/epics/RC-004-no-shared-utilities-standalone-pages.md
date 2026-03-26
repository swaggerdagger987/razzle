<!-- PM: root cause -->
---
id: RC-004
priority: P3
type: root cause
status: open
tickets: 302, 303, 304, 305, 306, 307, 308, 309
---

# Root Cause: Standalone pages duplicate logic instead of using app.js shared functions

## Pattern

8 tickets describe copy-pasted JS patterns across standalone pages that should be shared functions in app.js:

- **302-304** — 9 pages hardcode empty state text instead of `razzleEmpty()`
- **305-307** — 10 pages hardcode export watermark colors instead of `getExportColors()`
- **308-309** — 10 pages hardcode POS_COLORS instead of `getPosColors()`

## Why this keeps happening

Standalone pages were built independently, each copy-pasting common patterns. When shared functions were later added to app.js (e.g., `razzleLoading()`, `getPosColors()`), older pages weren't swept to adopt them.

## Suggested systemic fix

1. Complete the remaining shared function work (305 creates `getExportColors()`)
2. Execute the sweep tickets (302-304, 306-309) to adopt shared functions
3. Add a grep-based check: standalone HTML `<script>` blocks should not contain `getPropertyValue("--pos-qb")`, `rgba(237,224,207`, or `"no .* found for this`

## Execution order

305 (create shared fn) before 306-307. 308-309 depend on DQ-360a (getPosColors). 302-304 have no deps.
