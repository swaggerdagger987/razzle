---
id: S3-066
severity: S3
confidence: HIGH
category: code-quality
source: DQ-371,DQ-115
status: OPEN
---

# 65 standalone pages duplicate CSS in inline style blocks

## Root Cause

Each of the 65 standalone HTML pages embeds its own inline `<style>` block containing:
- Duplicate dark mode overrides
- Duplicate export/watermark styles
- Duplicate card/table styling

This creates ~50-200 lines of duplicated CSS per page, totaling ~5000+ lines of identical CSS across the codebase. Style changes must be applied to all 65 files individually.

## Fix

Extract shared standalone-page CSS into a common file:
```html
<link rel="stylesheet" href="standalone-common.css">
```

Each page keeps only page-specific styles inline.

## Files

- 65 standalone HTML files

## Acceptance Criteria

- Shared CSS extracted to one file
- Each standalone page's inline CSS reduced to page-specific rules only
