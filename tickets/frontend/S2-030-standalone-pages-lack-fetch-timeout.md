# S2-030: Standalone pages lack fetch timeout / offline handling

**Severity**: S2 (Minor)
**Category**: performance
**Source**: Deep Audit 2026-03-28, finding S2-010

## Problem

The Lab screener uses a 15-second AbortSignal timeout on API fetches, but
standalone pages (40+ HTML files) use plain `fetch()` with no timeout. If the
API is slow or offline, standalone pages show "pulling film..." indefinitely.

## Root Cause

- `frontend/lab.js:1295` — Lab screener correctly uses `AbortSignal.timeout(15000)`
- `frontend/warroom.js:1991` — Situation Room uses 10-second timeout
- Standalone pages (efficiency.html, consistency.html, breakouts.html, etc.)
  use plain `fetch('/api/...')` with no AbortController or timeout

Example standalone fetch without timeout:
- `frontend/efficiency.html` — `fetch('/api/efficiency-rankings?...')`
- `frontend/consistency.html` — `fetch('/api/consistency-rankings?...')`
- ~40 other standalone pages follow the same pattern

## Fix

Option A (per-page): Add `{ signal: AbortSignal.timeout(15000) }` to each
standalone page's fetch calls.

Option B (global, preferred): Create a shared `razzleFetch(url)` wrapper in
`app.js` that adds a 15-second timeout and converts timeout to a user-friendly
error state with retry button. Import in all pages.

## Scope

- Option A: 40+ files, 1 line each
- Option B: 1 new function in `app.js` + 40+ files import change
