# S3-009: No <main> landmark on any page

**Severity**: S3 (Low)
**Category**: a11y
**Source**: EDGE-CASES.md #59
**WCAG**: 1.3.1
**Found**: 2026-03-14
**Status**: OPEN

## Root Cause

No page in the project uses a `<main>` landmark element. Screen reader users cannot skip directly to main content. The skip-to-content links (added in Phase 14) exist but may not have a proper target.

## Fix

Wrap the primary content area of each page in `<main>`:
```html
<main id="main-content">
  <!-- page content -->
</main>
```

Update skip-to-content links to target `#main-content`.

## Files to Change

All 74 HTML files — add `<main id="main-content">` wrapper.

## Accept When

Every page has exactly one `<main>` landmark. Skip-to-content links target it.
