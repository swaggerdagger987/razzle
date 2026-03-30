# DQ-086: Standalone pages show only text loading state, no skeleton cards

**Priority**: P2 — perceived performance / polish
**Category**: Loading States / UX
**Files**: `frontend/dashboard.html:358`, `frontend/rankings.html:336`, `frontend/tiers.html:304`, `frontend/tradevalues.html`, 20+ other standalone pages

## Problem

Standalone pages (dashboard, rankings, tiers, trade values, breakouts, etc.) show a bare text loading state while data fetches:

```html
<div class="db-loading">pulling film...</div>
```

This renders as a single line of Caveat text on an otherwise empty page. While the text matches DESIGN.md personality ("pulling film..." not "Loading..."), the layout feels barren. The user sees a blank page with one small line of text for 1-3 seconds.

Compare to the Lab (lab.html) which has actual skeleton card placeholders — animated gray bars that match the final card layout. The Lab feels professional during load; standalone pages feel unfinished.

## Fix

Add a simple skeleton loader that matches each page's card layout. Example for dashboard:

```html
<div class="db-loading">
  <p style="font-family:var(--font-hand); font-size:18px; color:var(--ink-light);">pulling film...</p>
  <div class="skeleton-row" style="display:flex; gap:16px; margin-top:20px;">
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  </div>
</div>
```

The `.skeleton-card` class already exists in styles.css (added in Phase A design audit). Reuse it.

Start with the 5 most-visited standalone pages: dashboard, rankings, tiers, trade values, breakouts. The rest can follow the same pattern.

## Why It Matters

Skeleton loaders reduce perceived load time by 30-40% (Nielsen Norman research). The Lab already has them. The gap between Lab polish and standalone page polish is noticeable — it signals "the Lab is the real product, everything else is secondary."

## Verification

Open dashboard.html with network throttled to Slow 3G. During load, skeleton cards should appear instead of a blank page with one line of text.
