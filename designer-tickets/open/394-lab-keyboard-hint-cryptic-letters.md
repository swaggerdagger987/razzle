---
id: DQ-394
priority: P2
area: lab.html
section: tools dropdown
type: ux / discoverability
status: open
---

# Lab keyboard shortcut hint shows "H R B L I T D G A" with zero context

## What's wrong

lab.html line 3398 renders:

> keyboard: H R B L I T D G A

This is shown at the bottom of the Tools dropdown in 9px font. Nine single letters with no labels, no descriptions, no tooltips. A user who sees this has to:

1. Notice the tiny text
2. Memorize 9 letters
3. Press ? to find out what they do
4. Map them mentally

This violates the design principle "trust the user — don't over-explain" by UNDER-explaining. It's cryptic, not concise.

## Where

- `frontend/lab.html` line 3398: `.tools-dropdown-hint` div
- `frontend/lab.js` line ~735: hint font-size 9px

## Suggested fix

Option A: Show the shortcut next to each button it toggles:
"Heat (H)" "Pctl (R)" "Bars (B)" etc.

Option B: Replace the hint with: "Press ? for all keyboard shortcuts"

Option C: Remove the hint entirely — the ? shortcut modal already lists everything.

## Not a dupe of

- DQ-113 (keyboard shortcut onboarding toast) — that's about the first-visit toast, not the Tools dropdown hint
- DQ-348 (onboarding toast misleading) — that's about toast copy, not dropdown hint
