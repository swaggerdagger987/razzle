---
id: S2-097
severity: S2
confidence: MEDIUM
category: performance
source: DQ-223
status: OPEN
---

# innerHTML += for select options causes DOM thrashing — 18 instances in lab-panels.js

## Root Cause

`frontend/lab-panels.js` at 18 locations builds select option lists using `innerHTML +=` in a loop:

Lines: 6946, 7037, 7167, 7424, 7425, 7436, 7670, 7899, 7972, 8070, 8241, 8835, 8913, 9116, 9124, 9268, 9276, 9396

Pattern:
```javascript
seasons.forEach(s => {
  sel.innerHTML += '<option value="' + s + '">' + s + '</option>';
});
```

Each `innerHTML +=` forces the browser to: (1) read current innerHTML, (2) concatenate, (3) re-parse entire element, (4) reflow DOM. With 10+ seasons, this is 10+ reflows per dropdown.

The codebase already uses the correct pattern in most table/card rendering — accumulate string, single assignment.

## Fix

Accumulate options in a string, then assign once:
```javascript
let html = '';
seasons.forEach(s => { html += '<option value="' + s + '">' + s + '</option>'; });
sel.innerHTML = html;
```

## Files

- `frontend/lab-panels.js` — 18 instances across season/team dropdown builders

## Acceptance Criteria

- All select option builders use single innerHTML assignment
- No DOM thrashing on panel initialization
- Dropdowns populate correctly
