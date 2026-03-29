---
id: S3-068
severity: S3
confidence: MEDIUM
category: performance
source: DQ-123
status: OPEN
---

# addEventListener stacking — listeners added without removal on re-render

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

### Critical: Listeners stack in render loops (4 locations)

**1. `aging.html:617-660`** — `setupCanvasInteraction()` adds 3 listeners (mousemove:617, mouseleave:642, click:646) to canvas elements. Called from `renderData()` at line 728 on every position/season change. No `removeEventListener` before adding.

**2. `lab-panels.js:998-1012`** — `renderVorp()` adds click listeners to `th[data-sort]` (line 998-1006) and `tr[data-pid]` (line 1007-1012) via `querySelectorAll().forEach()`. Called on data load (line 1037) and sort/search. No removal.

**3. `lab-panels.js:729-734`** — Trade Value render adds click listeners to `.tv-row[data-pid]` elements on every render. Called on data load (line 748) and filter changes. No removal.

**4. `airyards.html:645-665`** — Render function adds click listeners to `th[data-sort]` (645-657) and `tr[data-pid]` (660-665). Called on season/position changes (lines 710, 720, 755). No removal.

### Good patterns to follow (correct cleanup):
- `lab.js:1646-1651` — Column resize: `removeEventListener` before `addEventListener`
- `formulas.js:154-163` — Stores handler reference, removes before re-adding
- `explorer.html:570-572` — Explicit `removeEventListener` before `addEventListener`

## Fix

For each critical location, add `removeEventListener` before `addEventListener`, or use event delegation on stable parent elements.

## Files

- `frontend/aging.html:617-660` — canvas interaction listeners
- `frontend/lab-panels.js:998-1012` — VORP render listeners
- `frontend/lab-panels.js:729-734` — Trade Value render listeners
- `frontend/airyards.html:645-665` — Air Yards render listeners

## Acceptance Criteria

- No duplicate event listeners after re-render
- Click handlers fire exactly once
