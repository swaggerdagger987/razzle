<!-- PM: ready -->
---
id: DQ-411
parent: RC-002 (Lab Interaction Lifecycle)
priority: P1
area: frontend/lab-panels.js
section: interaction lifecycle
type: bug fix
status: open
---

# Add AbortController to panel fetches

**File**: `frontend/lab-panels.js`

## What's wrong

When the user rapidly switches panels or triggers multiple fetches (e.g., clicking filters fast), previous in-flight fetch requests are not cancelled. This causes:

- Race conditions where an older response overwrites a newer one
- Wasted bandwidth and CPU on responses that will be discarded
- Potential stale data displayed if the slow request resolves last

## What to do

1. Create a module-level `AbortController` variable
2. Before each panel fetch, abort the previous controller and create a new one
3. Pass `{ signal: controller.signal }` to each fetch call
4. In the catch block, ignore `AbortError` (expected when cancelling)

## Accept when

- Rapid panel switching only renders the final panel's data
- No console errors from aborted fetches (AbortError is caught silently)
- Network tab shows cancelled requests when switching panels quickly
