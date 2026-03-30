# DQ-168: lab-panels.css hover shadows use 3px offset — off-spec

**Priority:** P3
**Area:** Lab Panels / Design System
**Type:** Shadow size violation
**Impact:** Hover lift feels inconsistent — 3px instead of design guide's 6px lift

---

## Problem

Two hover rules in lab-panels.css use `3px 3px 0` box-shadow instead of the design guide's `6px 6px 0` hover specification with `translate(-2px, -2px)`.

### Instances

1. **lab-panels.css:468**
   ```css
   .tl-player-chip:hover { box-shadow: 3px 3px 0 var(--ink-faint); }
   ```

2. **lab-panels.css:2308**
   ```css
   .mh-detail-player:hover { box-shadow: 3px 3px 0 var(--ink); }
   ```

DESIGN.md specifies hover should lift to `6px 6px 0` + `translate(-2px, -2px)`.

## Note

Different from DQ-014 (lab.html:2147,475) and DQ-040 (standalone page cards). These are lab-panels.css chip/player hover states.

## Fix

Update both hover rules:
```css
.tl-player-chip:hover {
  box-shadow: 6px 6px 0 var(--ink-faint);
  transform: translate(-2px, -2px);
}
.mh-detail-player:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

## Verification
- Hover over player chips in Tiers panel — should lift with 6px shadow.
- Hover over matchup detail players — same lift behavior.
