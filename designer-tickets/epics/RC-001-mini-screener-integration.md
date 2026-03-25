---
id: RC-001
type: root cause
priority: P1
area: index.html (mini-screener section)
status: open
children: [DES-350, DES-351, DES-353]
---

# Root Cause: Mini-screener built as static teaser without Lab integration

## Pattern

Three separate tickets (DES-350, DES-351, DES-353) all describe the home page mini-screener being disconnected from the Lab:

1. **DES-350** (100): Sort default (PPG) differs from Lab default (PPR total) — data mismatch
2. **DES-351** (101): Row clicks go to generic /lab.html with no player context — dead-end
3. **DES-353** (102): API failure shows error with no retry button — dead-end

## Root cause

The mini-screener was built as a quick visual preview (`fetch → render table → onclick="/lab.html"`) without designing it as a conversion funnel into the Lab. It shares no state, no sort logic, and no error handling patterns with the Lab screener.

## Recommended approach

Fix all three tickets together as a mini-screener integration pass:

1. Align sort key with Lab default (DES-350)
2. Pass player context on click via URL params (DES-351)
3. Extract fetch into named function + add retry button (DES-353)

These are three independent fixes in the same section of index.html (~lines 980-1040). A developer touching this code should fix all three in one pass to avoid re-reading the same section three times.

## Sequence

Fix in order: 350 (sort) → 353 (retry) → 351 (click context). Sort first because it changes the fetch URL. Retry second because it refactors the fetch into a named function. Click context last because it modifies row rendering.
