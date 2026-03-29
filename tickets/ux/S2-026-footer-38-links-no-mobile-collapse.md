# S2-026: Footer has 38 links with no mobile collapse

**Severity**: S2 (Minor)
**Category**: ux-flow
**Source**: Deep Audit 2026-03-28, finding S2-003

## Problem

The landing page footer contains 38 links across 5 categories (Razzle, Dynasty,
Weekly, Analytics, Tools). On mobile, these all stack vertically with no
collapsible behavior, creating a very long scroll.

## Root Cause

- `frontend/index.html:875-936` — Footer with 38 links in 5 grid columns
- `frontend/styles.css:1372-1410` — Footer uses CSS Grid with
  `grid-template-columns: repeat(auto-fit, minmax(110px, 1fr))` which reflows
  on mobile but never collapses

## Fix

Add collapsible accordion behavior for footer categories on mobile:
1. Each category heading becomes a toggle button at `max-width: 768px`
2. Category links collapse/expand on tap
3. All categories start collapsed on mobile
4. Desktop behavior unchanged

## Scope

- 2 files: `frontend/index.html` (data attributes), `frontend/styles.css` (mobile rules)
- ~20 lines CSS + ~10 lines JS
