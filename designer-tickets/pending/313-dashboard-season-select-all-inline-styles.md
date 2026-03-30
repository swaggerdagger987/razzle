---
id: DES-313
title: Dashboard season-select uses all inline styles — only page without CSS class
priority: P2
page: dashboard.html
category: Design System
cycle: 28
---

## Problem

Every standalone panel page uses a CSS class for its season-select styling (e.g., `.aging-season-select`, `.air-select`, `.breakouts-season-select`). Dashboard is the only page that puts all select styles inline:

```html
<select id="season-select" style="font-family:var(--font-mono); font-size:13px; padding:6px 10px; border:3px solid var(--ink); border-radius:var(--radius-sm); background:var(--bg-card); color:var(--ink);">
```

Inline styles can't be targeted by `[data-theme="dark"]` or `@media` queries.

## Where

- `frontend/dashboard.html` line 349

## Fix

1. Add a CSS class (e.g., `.dash-season-select`) in the page `<style>` block with the same properties
2. Replace inline style with the class
3. Add `aria-label="Season"` while you're there (DES-312)

## Evidence

- 20+ pages use CSS classes for season-select ✅
- dashboard.html uses inline style ❌
- Only outlier in the entire panel page pattern
