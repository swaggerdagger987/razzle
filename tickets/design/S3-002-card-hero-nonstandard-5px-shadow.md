# S3-002: card-hero uses non-standard 5px resting shadow

**Severity**: S3 (Low)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-407
**Found**: 2026-03-25
**Status**: OPEN

## Root Cause

`frontend/styles.css:849` — `.card-hero` uses `5px 5px 0` as resting state, which is between the standard (4px) and hover-lift (6px) sizes.

```css
.card-hero {
  border-width: 3px;
  box-shadow: 5px 5px 0 var(--ink);
}
```

## Fix

Use standard 4px resting state:
```css
.card-hero {
  border-width: 3px;
  box-shadow: 4px 4px 0 var(--ink);
}
```

## Files to Change

- `frontend/styles.css:849`

## Accept When

`.card-hero` uses `4px 4px 0` resting shadow.
