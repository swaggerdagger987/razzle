---
id: S2-014
severity: S2
category: ui-bug
title: "Cheat sheet print CSS exists but needs live verification"
status: needs-verification
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: frontend/S2-035-cheatsheet-print-css-untested.md
---

# S2-014: Cheat sheet print CSS may not be tested

## Finding

The cheat sheet has print CSS that may not have been tested recently.

## Root Cause

**File: `frontend/cheatsheet.html:218-227`** — Print CSS (10 lines):
```css
@media print {
  .topnav, footer, .cs-controls, .cs-actions, .cs-watermark { display: none !important; }
  .cs-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .cs-column { box-shadow: none; }
  /* font size reductions, white background */
}
```

The print layout:
- Hides nav, footer, controls, actions, watermark
- Sets 4-column grid with 8px gap
- Removes box-shadow from columns
- Reduces font sizes
- Sets white background

## Action Required

This needs manual print preview testing on a real browser to verify the output is usable for draft day. The CSS exists and looks reasonable, but there's no automated way to verify print layout.

## Acceptance Criteria

- [ ] Print preview produces clean 4-column draft board
- [ ] Nav, footer, and controls hidden in print
- [ ] Player names readable at printed font size
- [ ] Fits on letter-size paper (8.5x11)
