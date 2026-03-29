---
id: S2-125
severity: S2
confidence: HIGH
category: performance
source: EDGE-CASES.md #26
status: OPEN
---

# Warroom rAF loop runs headless after canvas removed from DOM

## Root Cause

`frontend/warroom.js:1312` calls `requestAnimationFrame(gameLoop)` at the end of every frame. The loop has two cleanup paths:

1. **Visibility change** (line 1436) — `cancelAnimationFrame` when tab hidden
2. **Page unload** (line 1454) — `cancelAnimationFrame` on `beforeunload`

**Missing**: No cleanup when the `canvasContainer` element is removed from the DOM during in-page navigation (e.g., SPA-style tab switching). The guard at line 1097 (`if (!document.getElementById('canvasContainer')) return;`) prevents *rendering* but does NOT prevent rAF from re-scheduling:

```javascript
// line 1312 — always schedules next frame, even when canvas is gone
_rafId = requestAnimationFrame(gameLoop);
```

When a user navigates away from the Situation Room via tab click (not a full page load), the canvas container is removed but the rAF loop continues firing 60x/second, calling `gameLoop` which early-returns at line 1097 but still burns CPU on the scheduling overhead. The `_rosterInterval` (line 1426) also leaks — `setInterval` runs every 1000ms with no DOM check.

**Impact**: ~2-5% CPU on idle tab after navigating away from Situation Room. On mobile, drains battery. On low-end devices, causes jank in the rest of the page.

## Fix

Add a DOM presence check inside `gameLoop` that cancels the loop when the canvas container is gone:

```javascript
function gameLoop(timestamp) {
  // Stop loop if canvas was removed from DOM (navigation away)
  if (!document.getElementById('canvasContainer')) {
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    if (_rosterInterval) { clearInterval(_rosterInterval); _rosterInterval = null; }
    return;
  }
  // ... rest of gameLoop
  _rafId = requestAnimationFrame(gameLoop);
}
```

Move the existing guard at line 1097 up into `gameLoop` itself (currently it's in the `draw` function or keydown handler — the actual `gameLoop` at line 1278 has no early exit).

## Files to Change

- `frontend/warroom.js:1278-1312` — add canvas-presence check at top of `gameLoop`, cancel rAF + interval if missing

## Accept When

1. Navigate to Situation Room → canvas renders, loop runs
2. Switch to another tab (e.g., Lab) without full page reload → `_rafId` is null, `_rosterInterval` is null
3. Return to Situation Room → loop restarts
4. No console errors during navigation

## Do NOT Touch

- Visibility change handler (line 1434-1450) — correct for tab switching
- `beforeunload` handler (line 1452-1456) — correct for page close
- Agent AI state machine — unrelated
- Canvas rendering logic — unrelated
