# DQ-028: 4 interactive elements missing :active press state

**Priority**: P2 — No tactile click feedback
**Category**: Interactive States
**Severity**: MEDIUM — Clickable elements feel "dead" without press animation

## Problem

These elements have cursor:pointer and :hover but no :active state (translate press-down):

| Element | File | Line |
|---------|------|------|
| `.ask-ref-item` | agents.html | ~470 |
| `.sidebar-recent-chip` | lab.html | ~214 |
| `.wkl-week-btn` | lab-panels.css | ~2498 |
| `.cmd-palette-item` | styles.css | ~1146 |

## Fix

Add `:active` rule for each:
```css
.ask-ref-item:active,
.sidebar-recent-chip:active,
.wkl-week-btn:active:not(:disabled),
.cmd-palette-item:active {
  transform: translate(1px, 1px);
}
```

Can be centralized or added per-element depending on specificity needs.
