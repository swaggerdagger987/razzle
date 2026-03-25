<!-- PM: ready -->
---
id: DQ-358d
parent: 358 (Orange Hover Hardcoded RGBA Sitewide)
priority: P2
area: frontend/lab.js, frontend/warroom.js
section: inline JS styles
type: color token
status: open
depends_on: DQ-358a
---

# Replace hardcoded rgba(217,119,87,0.08) in lab.js and warroom.js

**Files**: `frontend/lab.js` (line ~1901), `frontend/warroom.js` (line ~3228)

## What to do

These JS files set `background: rgba(217,119,87,0.08)` via inline styles. Replace with a read from the CSS variable:

```javascript
// Replace:
el.style.background = 'rgba(217,119,87,0.08)';
// With:
el.style.background = 'var(--orange-hover)';
```

## Accept when

- `grep -n "rgba(217,119,87" frontend/lab.js frontend/warroom.js` returns 0 matches
- Affected elements still show hover tint
- Dark mode still works

## Depends on

DQ-358a (CSS variable must exist first)
