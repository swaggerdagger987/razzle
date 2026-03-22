# DES-043: Bureau connect card has 3 design violations — conversion gateway

**Priority**: P1
**Area**: league-intel.html (Bureau of Intelligence)
**Impact**: The Bureau's connect card — the FIRST thing a user sees when they click "League Intel" — has a 6px shadow at rest, a 16px radius orphan, and JS-generated cards with inline `border-radius:10px`. The Bureau is the conversion engine. Its first impression is off-spec.

## The Problem

**1. Connect card — 6px shadow at rest (line 37):**
```css
.connect-card {
  box-shadow: 6px 6px 0 var(--ink);  /* ← should be 4px */
}
```
DESIGN.md says 4px base, 6px hover. This card has no hover-lift because it starts at max.

**2. Connect card — 16px radius (line 36):**
```css
.connect-card {
  border-radius: 16px;  /* ← not a token (8/12/20) */
}
```

**3. JS-generated Bureau cards — inline 10px radius:**
- Line 2442: stats cards `border-radius:10px`
- Line 6337: odds cards `border-radius:10px`
- Line 6517: odds cards `border-radius:10px`
- Line 7342: alert banner `border-radius:10px`

These inline styles can't be overridden by CSS classes.

**4. Alert banner — hardcoded fallback hex (line 7342):**
```javascript
'background:var(--orange-light,#f7e4d8);'  // fallback is fine but 10px radius is not
```

## The Fix

```css
.connect-card {
  border-radius: var(--radius);  /* 12px */
  box-shadow: 4px 4px 0 var(--ink);  /* spec: 4px base */
}
.connect-card:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

For JS-generated cards: replace `border-radius:10px` with `border-radius:var(--radius-sm)` or `border-radius:var(--radius)`.

## Why This Matters

The Bureau is the conversion engine (North Star: "If a connected user doesn't feel the urge to upgrade, the Bureau isn't good enough"). The connect card is literally the first thing a user sees. Three design violations on the conversion gateway undermines the "this is polished" impression that drives upgrades.
