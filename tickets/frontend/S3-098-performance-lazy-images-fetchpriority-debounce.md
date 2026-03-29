---
id: S3-098
severity: S3
confidence: MEDIUM
category: performance
source: DQ-125+145+146+372+427
status: OPEN
---

# Performance polish — lazy images, fetchpriority, debounce, timer cleanup

## Problems

1. **19 of 38 img tags missing `loading="lazy"`** (DQ-125) — Below-fold images load eagerly, adding unnecessary initial page weight.
2. **No `fetchpriority="high"` on above-fold images** (DQ-145) — 0 instances sitewide. Hero images and mascot should prioritize loading.
3. **No `decoding="async"` on images** (DQ-146) — 0 instances across 38 img tags. Async decoding prevents image decode from blocking main thread.
4. **Canvas resize handlers fire without debounce** (DQ-372) — `aging.html` and `explorer.html` resize handlers redraw canvas on every resize event, causing jank during window resizing.
5. **AbortController timeout not cleared in catch block** (DQ-427) — Fetch timeout timers (`setTimeout` for AbortController) are not cleared when fetch resolves or rejects, creating orphaned timers.

## Fix

1. Add `loading="lazy"` to all below-fold images
2. Add `fetchpriority="high"` to hero/mascot images
3. Add `decoding="async"` to all `<img>` tags
4. Wrap canvas resize handlers in `requestAnimationFrame` or 150ms debounce
5. Clear AbortController timeouts in both `.then()` and `.catch()`

## Files

- All 75 HTML files — img tag attributes
- `frontend/aging.html`, `frontend/explorer.html` — resize handlers
- `frontend/app.js` or fetch utility — AbortController timeout cleanup

## Acceptance Criteria

1. Below-fold images have `loading="lazy"`
2. Above-fold images have `fetchpriority="high"`
3. Canvas resize doesn't cause jank
4. No orphaned setTimeout timers after fetch completion
