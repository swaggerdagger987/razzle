---
id: S2-122
severity: S2
confidence: HIGH
category: mobile
source: DQ-472
status: OPEN
---

# League-intel.html has multiple touch targets below 44px on mobile

## Root Cause

Several interactive elements on the Bureau page have touch targets well below the 44px WCAG AA minimum at mobile viewports.

**File**: `frontend/league-intel.html`

1. **Bureau tabs at 480px** — line 1905: `font-size: 11px; padding: 8px 12px` (~30px height)
2. **Bureau tabs at 375px** — line 1932: `font-size: 10px; padding: 6px 10px` (~26px height)
3. **Roster position badges** — line 174: `padding: 1px 5px` (~18px height)
4. **Activity type badges** — line 225: `padding: 2px 6px` (~20px height)
5. **Tab lock icons** — line 1092: `padding: 1px 6px` (~16px height)

## Fix

Add `min-height: 44px` to all interactive elements at mobile breakpoints:

```css
@media (max-width: 480px) {
  .bureau-tab { min-height: 44px; display: flex; align-items: center; }
}
```

For non-interactive badges (roster-pos, activity-type), ensure they have adequate spacing between them so adjacent touch targets don't overlap.

## Acceptance Criteria

- [ ] All tappable elements on league-intel.html are at least 44px tall at 375px
- [ ] Bureau tabs are comfortably tappable on iPhone SE
- [ ] Non-interactive badges have adequate spacing
