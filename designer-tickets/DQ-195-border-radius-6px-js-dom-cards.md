---
id: DQ-195
priority: P2
category: border-radius
status: open
---

# DQ-195: border-radius:6px on JS-created cards and canvas — off-token

## Problem

DESIGN.md tokens: `--radius-sm: 8px`, `--radius: 12px`, `--radius-lg: 20px`. 6px is not a token.

`lab-panels.js` creates 5 DOM elements with `border-radius:6px` that are NOT inner bar fills (those are exempt per DES-058):

| Line | Element | What it is |
|------|---------|------------|
| 9577 | `<div>` card | Draft class comparison stat box |
| 9600 | `<div>` card | Position breakdown card with border-left accent |
| 10003 | `<canvas>` | Dynasty Power Rankings chart element |
| 10176 | `<div>` badge | Grade badge in rankings |

And `lab.js` line 9206:
| 9206 | `<div>` bar fill | Trade value bar inner fill |

The canvas element (10003) is the most visible — it's the primary chart on the Dynasty Power Rankings panel, with a 3px border + 4px shadow. The 6px radius doesn't match any token.

## Fix

Replace `border-radius:6px` with `border-radius:var(--radius-sm)` (8px) on all 5 instances.

For the lab.js bar fill (9206), this is an inner fill element — per DES-058 exception, 6px is acceptable. **Skip line 9206.**

```javascript
// lab-panels.js lines 9577, 9600, 10003, 10176
border-radius:6px  →  border-radius:var(--radius-sm)
```

## Scope

4 edits in `frontend/lab-panels.js`. Skip `lab.js:9206` (bar fill exception).
