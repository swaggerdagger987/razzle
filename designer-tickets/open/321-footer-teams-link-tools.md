<!-- PM: ready -->
---
id: DES-349b
parent: 349 (Footer Teams Link Epic)
priority: P3
area: tool pages (breakouts, buysell, consistency, etc.)
section: footer navigation
type: ux / navigation
status: open
---

# Remove hardcoded /team/KC footer link from tool pages

**Files**: All tool/dashboard pages with inline footers (breakouts, buysell, consistency, dashboard, efficiency, rankings, scarcity, stocks, tiers, tradevalues, weekly, etc.)

## What to do

Search all HTML files in `frontend/` for `/team/KC` in footer sections. Remove the "Teams" link from each. This is a search-and-replace operation.

## Accept when

- `grep -r "/team/KC" frontend/` returns zero matches in footer contexts
- No other footer links removed
- Footer layout doesn't break on any page
