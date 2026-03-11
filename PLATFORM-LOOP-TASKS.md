# Platform Loop — Phase 155 Task List

## Status
Current Phase: 155 (Landing Page — Mini Pixel Canvas War Room Preview)
Current Task: 2
Current Stage: COMPLETE
Attempt: 1/3
Tasks Completed: 2/2
Loop Iterations: 2

---

## Phase Rationale

The North Star specifies for the landing page:
> "Agents visibly working but content redacted" — the War Room demo on the landing page should show agents working with outputs redacted.

The landing page already has the 55-permutation demo briefing system with redacted `<r>` tags. But it lacked a visual pixel canvas preview showing the agents moving around the War Room. This creates the "alive" feeling that hooks users before they even scroll to the demo briefings.

---

## Task 1: Mini Pixel Canvas Preview
**Requirement**: "Agents visibly working but content redacted" from North Star landing page demo spec.
**Accept when**: (1) Canvas element in the War Room demo section of index.html. (2) 6 colored agent dots matching actual agent colors. (3) Furniture/desk rectangles creating a room feel. (4) Activity bubbles with redacted symbols (???, !!!, ...). (5) Scanline effect and monitor glow. (6) IntersectionObserver for performance. (7) Dark background matching Situation Room dark mode.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND
**Status**: PASS — Canvas with 6 agents, furniture, monitor glow, activity bubbles, scanline effect, IntersectionObserver

## Task 2: QA + Syntax Verification
**Requirement**: No JS errors, page still serves correctly.
**Accept when**: (1) All inline JS blocks pass node --check. (2) Page serves 200. (3) No regressions.
**Depends on**: Task 1
**Size**: S
**Primary role**: QA
**Status**: PASS — 4 executable JS blocks pass syntax check, page serves 200
