<!-- PM: ready -->
---
id: DQ-415a
parent: 415 (Bureau Terminology Epic)
priority: P1
area: frontend/league-intel.html
section: page title / heading
type: copy consistency
status: open
---

# Pick canonical name for League Intel / Bureau and update source page

## Context

The same feature is called "League Intel" (nav), "Bureau of Intelligence" (page title), and "Bureau" (pricing/home). Parent ticket: DQ-415 in epics/.

## What to do

1. **Decision**: Use "Bureau" as the canonical short name in nav and UI. Use "Bureau of Intelligence" as the full name on the page itself. (Matches DESIGN.md brand hierarchy.)
2. Update `frontend/league-intel.html`:
   - `<title>` → "Bureau of Intelligence — Razzle"
   - `<h1>` → "Bureau of Intelligence"
   - Any in-page references to "League Intel" → "Bureau of Intelligence" or "the Bureau"

## Accept when

- league-intel.html title and h1 both say "Bureau of Intelligence"
- No "League Intel" text remains on the page itself
