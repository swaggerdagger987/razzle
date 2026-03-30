# DES-050: league-intel.html hover-lift broken on league cards and profile cards

**Priority**: P1
**Area**: league-intel.html (Bureau cards)
**Found by**: Design QA Cycle 5

## Problem

Two card types on the Bureau page have broken hover-lift behavior:

### league-card (line 106-109):
- **Base**: `box-shadow: 4px 4px 0 var(--ink)`
- **Hover**: `box-shadow: 4px 4px 0 var(--ink)` + `translate(-2px, -2px)`
- **Bug**: Hover shadow is IDENTICAL to base shadow. The card translates but the shadow doesn't grow — looks like the card slides instead of lifts.

### profile-card (line 332-335):
- **Base**: `box-shadow: 2px 2px 0 var(--ink)` (line 327)
- **Hover**: `box-shadow: 3px 3px 0 var(--ink)` + `translate(-1px, -1px)`
- **Bug**: Only 1px shadow increase and 1px translate — too subtle to feel "physical."

### DESIGN.md spec:
- Base: `4px 4px 0 var(--ink)`
- Hover: `6px 6px 0` + `translate(-2px, -2px)`

## Conversion impact

Bureau cards are the primary interactive surface for connected users. League cards are the first thing users click after connecting Sleeper. Broken hover-lift makes them feel static instead of physical.

## Fix

```css
.league-card:not(.expanded):hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}

.profile-card:hover {
  box-shadow: 4px 4px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```
