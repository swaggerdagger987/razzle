---
id: DQ-192
priority: P2
category: mobile
status: open
---

# DQ-192: Trade Analyzer autocomplete dropdowns have fixed width:280px — no mobile guard

## Problem

The Trade Analyzer autocomplete dropdowns in `lab.html` have `width:280px` with no `max-width` constraint:

- **Line 3893**: `<div id="tvAutoA" ... width:280px;">`
- **Line 3907**: `<div id="tvAutoB" ... width:280px;">`

At 375px mobile, a 280px dropdown positioned inside a flex container will overflow the viewport edge.

## Fix

Change `width:280px` to `width:100%; max-width:280px` on both elements:

```html
<div id="tvAutoA" style="... width:100%; max-width:280px;"></div>
<div id="tvAutoB" style="... width:100%; max-width:280px;"></div>
```

## Scope

2 inline style edits in `frontend/lab.html` (lines 3893, 3907).
