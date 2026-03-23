---
id: DQ-156
priority: P2
area: content
section: brand-credibility
type: bug
status: open
---

# Demo content shows stale "2024 Season" — two years out of date

## What's wrong

The Bureau of Intelligence (league-intel.html) demo/preview section shows hardcoded "2024 Season" and a team named "DynastyKing2024". It's March 2026 — this makes the demo look abandoned and untended. First-time visitors seeing "2024" will assume the tool hasn't been updated.

## Where

- `frontend/league-intel.html:7364` — `{name: "DynastyKing2024", record: "9-4", ...}`
- `frontend/league-intel.html:7380` — `"12-team Dynasty Superflex | 2024 Season"`

## Fix

1. Change `DynastyKing2024` to `DynastyKing2025` (or remove the year from the name entirely — "DynastyKing" is cleaner)
2. Change `2024 Season` to `2025 Season`
3. Consider using a dynamic year: `new Date().getFullYear()` or the `_current_nfl_season()` pattern already established in the codebase

## Why it matters

Brand credibility. A user evaluating whether to connect their Sleeper league will see "2024 Season" in the demo and think "this hasn't been updated in 2 years." First impressions are everything.
