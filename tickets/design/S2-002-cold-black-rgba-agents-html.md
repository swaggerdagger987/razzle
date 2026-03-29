# S2-002: Cold black rgba(0,0,0) in agents.html — should be espresso

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-401, DESIGN-TICKETS.md #2
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/agents.html:39,259,285` — Three instances of cold black `rgba(0,0,0,...)` instead of warm espresso `rgba(45,31,20,...)`. DESIGN.md says "always use espresso brown (#2d1f14), never navy/charcoal/gray."

```css
/* Line 39 */  filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15));
/* Line 259 */ box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
/* Line 285 */ filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
```

## Fix

```css
/* Line 39 */  filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));
/* Line 259 */ box-shadow: 4px 4px 0 var(--ink);
/* Line 285 */ filter: drop-shadow(2px 2px 0 rgba(45,31,20,0.3));
```

## Files to Change

- `frontend/agents.html:39,259,285`

## Accept When

Zero instances of `rgba(0,0,0` in agents.html.
