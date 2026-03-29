---
id: S3-058
severity: S3
confidence: HIGH
category: a11y
source: DQ-099
status: OPEN
---

# All 47 table elements missing `<caption>` — WCAG 1.3.1 violation

## Root Cause

All HTML `<table>` elements across the site lack `<caption>` elements. Screen readers can't announce what data each table contains, making tables indistinguishable for blind users.

## Fix

Add visually hidden `<caption>` to each table:
```html
<table>
  <caption class="sr-only">Player statistics sorted by PPR points</caption>
  ...
</table>
```

The `sr-only` class already exists in styles.css for this purpose.

## Files

- All HTML files containing `<table>` elements (47 instances across ~30 files)

## Acceptance Criteria

- Every table has a descriptive `<caption>` element
- Captions describe the table's content, not just "Table 1"
