# S3-041: Agents mascot SVG image has empty alt text

**Severity**: S3 (Low)
**Category**: a11y
**Source**: designer-tickets DQ-009
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/agents.html:1633` — Razzle mascot image has `alt=""` (empty), making it invisible to screen readers. This image is not decorative — it represents the Razzle mascot character and conveys meaning.

```html
<!-- agents.html:1633 -->
<img src="/assets/agents/razzle.svg" width="28" height="28" alt="">
```

Per WCAG 1.1.1, meaningful images must have descriptive alt text. Empty alt is only appropriate for purely decorative images.

## Fix

```html
<img src="/assets/agents/razzle.svg" width="28" height="28" alt="Razzle — Chief of Staff">
```

## Files to Change

- `frontend/agents.html:1633` — add descriptive alt text

## Accept When

1. Mascot image has descriptive alt text
2. Screen reader announces the image meaningfully

## Do NOT Touch

- Image source path or dimensions
- Other images on the page
