---
id: S2-120
severity: S2
confidence: HIGH
category: design
source: DQ-207
status: OPEN
---

# Home page feature cards and social cards have no hover lift

## Root Cause

DESIGN.md specifies cards should lift on hover: `6px 6px 0 + translate(-2px, -2px)`. The home page `.feature-card` and `.social-card` classes define resting shadows but no `:hover` transition.

**File**: `frontend/index.html:333-357` (feature-card CSS)

```css
.feature-card {
  box-shadow: 4px 4px 0 var(--ink);
  /* NO :hover rule */
}
```

**File**: `frontend/index.html:432-459` (social-card CSS)

```css
.social-card {
  box-shadow: 4px 4px 0 var(--ink);
  /* NO :hover rule */
}
```

Only `.smart-chip:hover` (line 375-380) has the correct hover pattern on the home page.

## Fix

Add hover lift to both card classes:

```css
.feature-card, .social-card {
  transition: box-shadow 0.15s, transform 0.15s;
}
.feature-card:hover, .social-card:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

## Acceptance Criteria

- [ ] `.feature-card` lifts on hover with 6px shadow + translate(-2px, -2px)
- [ ] `.social-card` lifts on hover with same treatment
- [ ] Transition is smooth (0.15s)
