---
id: S3-050
severity: S3
category: ux
finding_ref: BUG-007
confidence: HIGH
---

# S3-050: VORP panel and standalone page missing player search

## Root Cause

`frontend/vorp.html` -- The standalone VORP page renders a full table with
position filter tabs and sortable columns but has no player search input.
Users must visually scan the entire table to find a specific player.

The Lab panel version (`lab.html:3218` + `lab.js:2908`) also lacks a
dedicated search within the VORP context -- it relies on the global Lab
search which filters across all panels, not within VORP results.

Other comparable standalone pages (rankings.html, tiers.html, leaders.html)
all include a search input above the table.

## What to Fix

Add a search input to `vorp.html` above the table:
```html
<input type="text" id="vorp-search" placeholder="search players..."
  style="..." oninput="filterVorpTable(this.value)">
```

And a simple JS filter function that hides rows not matching the search term.

## Files to Change

- `frontend/vorp.html` -- add search input and filter function

## Acceptance Criteria

- [ ] Search input visible above the VORP table
- [ ] Typing a player name filters the table in real-time
- [ ] Clearing search restores the full table
- [ ] Search works with position filters still applied

## Do NOT

- Do not add search to the Lab panel version (Lab has its own global search)
