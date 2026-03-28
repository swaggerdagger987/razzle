# S3-027: Print CSS uses hardcoded #fff background

**Severity**: S3 (Low)
**Category**: design
**Source**: DESIGN-TICKETS.md #10
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/cheatsheet.html:227` uses `background: #fff` in `@media print` CSS. This is the only hardcoded `#fff` in any HTML/CSS file.

While white paper is reasonable for print output, it deviates from the design system's token-based approach.

## Fix

Either:
- Replace with `background: var(--bg-card)` (will resolve to near-white)
- Add a `/* print: intentional white paper */` comment to document the exception

## Files to Change

- `frontend/cheatsheet.html:227`

## Accept When

Either the hardcoded `#fff` is replaced with a CSS variable, or documented with a comment explaining the intentional print exception.
