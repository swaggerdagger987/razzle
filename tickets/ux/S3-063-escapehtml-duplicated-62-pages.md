---
id: S3-063
severity: S3
confidence: HIGH
category: code-quality
source: DQ-328
status: OPEN
---

# escapeHtml() duplicated in 62 standalone pages instead of shared

## Root Cause

The `escapeHtml()` XSS prevention function is copy-pasted into 62 standalone page `<script>` blocks. Each copy is identical. If a bug is found in the implementation, it must be patched in 62 places.

## Fix

Move escapeHtml() to app.js (or a shared utils.js) and remove all 62 copies from standalone pages.

## Files

- 62 standalone HTML files
- `frontend/app.js` — destination for shared function

## Acceptance Criteria

- Single escapeHtml() definition in shared JS
- All standalone pages reference the shared version
- XSS protection unchanged
