<!-- PM: ready -->
---
id: RC-002
priority: P1
area: frontend/lab.js, frontend/lab-panels.js
section: interaction lifecycle
type: root cause
status: open
covers: 100 (DQ-413), 101 (DQ-412), 102 (DQ-411), 203 (DQ-414)
---

# Root Cause: Lab has no unified cleanup lifecycle for state transitions

## Pattern

Four tickets describe the same underlying problem: when state changes in the Lab (re-render, panel switch, filter change, sort), there is no single function that:

1. Cancels in-flight fetch requests (tickets 102, 203)
2. Dismisses all floating UI (tickets 101, 100)
3. Resets transient interaction state (ticket 203)

Each ticket is a different symptom of this missing lifecycle hook.

## Recommended execution order

1. **Ticket 100** (DQ-413) — Fix `closeAllOverlays()` to cover all 5 overlay types. Foundation.
2. **Ticket 101** (DQ-412) — Call the fixed `closeAllOverlays()` from `fetchAndRender()`. Depends on 100.
3. **Ticket 102** (DQ-411) — Add AbortController to panel fetches. Independent.
4. **Ticket 203** (DQ-414) — Fix expanded rows race condition. Independent.

## Long-term

Consider a `labLifecycle.beforeStateChange()` hook that all state-changing functions call, which handles cleanup in one place. But fixing the 4 tickets individually is the right first step — each is scoped to one file and one pattern.
