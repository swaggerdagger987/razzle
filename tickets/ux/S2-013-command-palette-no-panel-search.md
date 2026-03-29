# S2-013: Command palette only searches players — 70+ panels undiscoverable

**Severity**: S2 (Medium)
**Category**: ux-flow
**Source**: EDGE-CASES.md #39
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/app.js:1015-1213` — Ctrl+K command palette only searches players via `/api/players/quick-search`. It does not search Lab panels, standalone pages, or site features.

With 70+ panels consolidated into the Lab sidebar, users have no way to discover "Air Yards Dashboard" or "Snap Efficiency" except by scrolling through the sidebar.

## Fix

Add a "pages/panels" section to command palette results. When the search query matches a panel name (fuzzy), show it as a navigable result:

```javascript
const PANELS = [
  { name: "Air Yards Dashboard", url: "/lab.html?panel=airyards" },
  { name: "Trade Finder", url: "/lab.html?panel=tradefinder" },
  // ... all 70+ panels
];
```

Show panels above players in results. Keyboard navigation (arrow keys + Enter) to open.

## Files to Change

- `frontend/app.js:1015-1213` — add panel/page search to command palette

## Accept When

1. Ctrl+K → type "air yards" → see "Air Yards Dashboard" result → Enter navigates to it
2. Panel results appear above player results
3. All 70+ panels are searchable

## Do NOT Touch

- Player search functionality — keep it working alongside panel search
- API endpoint — panel search is client-side only (static list)
