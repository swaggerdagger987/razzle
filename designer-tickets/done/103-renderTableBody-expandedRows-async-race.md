<!-- PM: ready -->
# DQ-414: renderTableBody() resets _expandedRows before async fetch completes

**Priority**: P2
**Category**: Interaction Lifecycle
**Files**: `frontend/lab.js` (line ~2010-2028)

## Problem

When a row is expanded (click rank # to see weekly breakdown), `toggleRowExpand()` starts an async fetch for weekly stats. If `renderTableBody()` is called before the fetch completes (triggered by a filter, sort, or pagination change):

1. Line ~2011: `_expandedRows = {}` clears the expanded state immediately
2. The async fetch completes after the re-render
3. The callback checks `if (!_expandedRows[playerId]) return` which is now always true
4. The weekly data is silently dropped

## What the user sees

- Click rank # to expand a row (weekly stats start loading)
- Before it loads, click a column header to sort
- Table re-renders, expansion is lost
- Weekly data fetch completes but is silently discarded
- Row appears collapsed with no indication data was loading

## Fix

Either:
1. Cancel the fetch via AbortController when `_expandedRows` is cleared
2. Or re-expand rows that were expanded before the re-render (save and restore state)
