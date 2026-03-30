---
id: DQ-328
title: escapeHtml() redefined in 62 standalone pages — app.js already has it
priority: P3
category: code-duplication
page: 62 standalone HTML pages
---

## Problem
`escapeHtml()` is defined in `app.js` (line 559) and loaded on every page. Despite this, 62 standalone HTML pages redefine the exact same function in their inline `<script>` blocks.

**app.js line 559 (shared, already loaded):**
```js
function escapeHtml(str) { ... }
```

**62 pages each contain their own copy**, e.g.:
```js
function escapeHtml(s) {
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
```

852 total references across 70 files. Every inline copy shadows the app.js version, creating divergence risk: if the app.js version is patched (e.g., for a new XSS vector), the 62 inline copies remain unpatched.

## Impact
- Maintenance burden: XSS fix must be applied in 63 places instead of 1
- ~3KB of duplicated JS per page × 62 pages = ~186KB of wasted bandwidth
- Divergence risk: inline copies may already differ from app.js version

## Expected
Remove all inline `escapeHtml` definitions. Every page already loads app.js.

## Fix
- Delete the `function escapeHtml(...)` block from each of the 62 standalone HTML pages
- Verify app.js version covers all use cases (DOM-based vs regex-based)

62 deletions across 62 files. Could be scripted.

## Files
- 62 standalone HTML pages in `frontend/` (see grep results for full list)
- `frontend/app.js` (reference — keep this one)
