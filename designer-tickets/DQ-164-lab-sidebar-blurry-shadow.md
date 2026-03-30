# DQ-164: Lab sidebar uses conventional blurry shadow — breaks comic-strip aesthetic

**Priority:** P2
**Area:** Lab / Design System
**Type:** Design guide violation
**Impact:** Sidebar shadow looks "normal web app" instead of comic-strip offset. Visible every time Lab sidebar opens.

---

## Problem

lab.html:596 uses a conventional blurry drop-shadow on the sidebar:
```css
box-shadow: -8px 0 24px rgba(45, 31, 20, 0.15);
```

DESIGN.md specifies flat comic-strip offset shadows: `4px 4px 0 var(--ink)` — zero blur. A 24px gaussian blur shadow is the opposite of the chunky, intentional aesthetic.

Additionally, this shadow uses hardcoded `rgba(45,31,20,0.15)` with no dark mode override — in dark mode, the brown shadow on dark brown background provides zero visual separation.

## Note

Different from DQ-069 which covers lab.html:1040 (sticky header shadow). This is the sidebar overlay at line 596.

## Fix

Replace with a comic-strip offset shadow:
```css
box-shadow: -4px 0 0 var(--ink);
```

Or if separation is needed without full ink weight:
```css
box-shadow: -4px 0 0 var(--ink-faint);
```

## Verification
- Open Lab, click sidebar toggle — shadow should be flat offset, not blurry gaussian.
- Check in dark mode — shadow should still provide visual separation.
