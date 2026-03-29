# S3-001: Sticker chip hover shadow is 5px — should be 6px

**Severity**: S3 (Low)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-406
**Found**: 2026-03-25
**Status**: OPEN

## Root Cause

`frontend/styles.css:1697,1701` — DESIGN.md specifies hover-lift as `6px 6px 0 + translate(-2px, -2px)`. Sticker chips use `5px 5px 0`.

```css
.sticker-chip:hover { box-shadow: 5px 5px 0 var(--ink); }         /* Line 1697 */
.sticker-chip--rotated:hover { box-shadow: 5px 5px 0 var(--ink); } /* Line 1701 */
```

## Fix

```css
.sticker-chip:hover { box-shadow: 6px 6px 0 var(--ink); }
.sticker-chip--rotated:hover { box-shadow: 6px 6px 0 var(--ink); }
```

## Files to Change

- `frontend/styles.css:1697,1701`

## Accept When

Both sticker-chip hover rules use `6px 6px 0`.
