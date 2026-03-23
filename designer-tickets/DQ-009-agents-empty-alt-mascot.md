# DQ-009: Razzle mascot image has empty alt text on agents page

**Priority**: P3 — accessibility
**Category**: Accessibility
**Files**: `frontend/agents.html:1633`

## Problem

The Razzle mascot SVG image in the Situation Room header has an empty alt attribute:
```html
<img src="/assets/agents/razzle.svg" width="28" height="28" alt="">
```

Empty alt means screen readers skip this entirely. Since this is the brand mascot in the main header, it should have descriptive alt text.

## Fix

```html
<img src="/assets/agents/razzle.svg" width="28" height="28" alt="Razzle mascot">
```

## Verification

Run an accessibility audit or check with a screen reader. The mascot image should be announced.
