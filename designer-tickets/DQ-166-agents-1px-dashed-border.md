# DQ-166: agents.html border-top:1px dashed — should be 2px

**Priority:** P3
**Area:** Situation Room / Design System
**Type:** Border width violation
**Impact:** Thin dashed border breaks chunky aesthetic in agent findings section

---

## Problem

agents.html:2271 uses a 1px dashed border divider inside agent finding cards:
```javascript
'<div style="display:flex; gap:8px; align-items:flex-start; margin-top:10px; padding-top:10px; border-top:1px dashed var(--ink-faint);">'
```

DESIGN.md specifies: "Dashed dividers: 2px dashed `var(--ink-faint)` inside cards"

## Note

Not covered by DQ-004 which lists charts.js, lab.js, formulas.js, player.js, lab-panels.js — agents.html was missed.

## Fix

Change `border-top:1px dashed` to `border-top:2px dashed`:
```javascript
'<div style="display:flex; gap:8px; align-items:flex-start; margin-top:10px; padding-top:10px; border-top:2px dashed var(--ink-faint);">'
```

## Verification
- Run an agent query in the Situation Room.
- Agent findings with sub-dividers should use chunky 2px dashed borders.
