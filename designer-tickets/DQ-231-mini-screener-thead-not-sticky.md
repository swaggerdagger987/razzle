---
id: DQ-231
priority: P1
category: UX / home page
pages: index.html
status: open
cycle: 33
---

# Mini-screener table headers scroll away on home page

## What's wrong

The home page mini-screener has `max-height: 360px; overflow-y: auto` on `.mini-screener-body` (line 391-393), but the `<thead>` has no `position: sticky; top: 0` rule. When a visitor scrolls the mini-screener table, the column headers (Player, Pos, Team, PPG, etc.) disappear off the top.

This is the FIRST data table a new user sees. Losing headers in a stats table is disorienting — the user can't tell what column they're reading.

## Evidence

`frontend/index.html` line 402-414: `.mini-table th` has no sticky positioning. The `.mini-screener-body` wrapper creates the scroll container but headers scroll with content.

## Fix

Add sticky positioning to the mini-table thead:

```css
.mini-table thead th {
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 2;
}
```

## Verification

Open index.html. Scroll the mini-screener table past 10 rows. Column headers should stay pinned at the top of the scroll container.
