<!-- PM: ready -->
# DQ-404: No Unsaved Changes Warning Before Page Navigation

**Priority**: P1 (data loss)
**Category**: State Safety
**Page**: lab.html (Screener)

## Problem

The Lab has many interactive features that create unsaved local state: player notes (140 char annotations), tags (BUY/SELL/WATCH), formulas in progress, saved view edits. None of these trigger a `beforeunload` warning when the user navigates away or refreshes.

A user types a detailed player note, accidentally hits F5 or closes the tab, and the note is lost silently. Notes and tags auto-save to localStorage, but formulas being edited in the formula builder do NOT auto-save until explicitly saved.

## Fix

Add a `beforeunload` handler that fires when:
1. The formula builder overlay is open with unsaved changes
2. A note editor is open with text that hasn't been saved

Do NOT fire beforeunload for normal screener state (filters, columns, sort) since those are already persisted to URL + localStorage.

```javascript
window.addEventListener('beforeunload', function(e) {
  if (document.getElementById('formulaOverlay')?.classList.contains('open')) {
    e.preventDefault();
  }
});
```

## Evidence

- Formula builder overlay at line ~3555 in lab.js — no auto-save during editing
- Note editor at line ~582 — auto-saves on close, but close-without-save path exists
- No `beforeunload` handler anywhere in lab.js or app.js
