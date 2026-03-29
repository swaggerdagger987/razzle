---
id: S2-070
severity: S2
confidence: HIGH
category: design
source: DQ-161
status: OPEN
---

# Canvas watermark invisible in dark mode — 10 standalone pages

## Root Cause

**Shared watermark function** — `frontend/app.js:534,543`:
```javascript
var wmAlpha = 'rgba(45,31,20,0.15)';  // line 534 — hardcoded light-mode color
// ...
ctx.fillStyle = wmAlpha;               // line 543 — no dark mode check
```

The `drawWatermark()` in app.js uses hardcoded espresso rgba without checking `document.documentElement.dataset.theme`. Some pages (like `advantage.html:315`, `aging.html:786`) have their own watermark code with theme checks, but these 10 pages use the app.js version without overriding the color.

## Affected Pages

1. `frontend/drops.html`
2. `frontend/gamescript.html`
3. `frontend/dualthreat.html`
4. `frontend/garbagetime.html`
5. `frontend/seasonpace.html`
6. `frontend/snapefficiency.html`
7. `frontend/successrate.html`
8. `frontend/targetpremium.html`
9. `frontend/tdregression.html`
10. `frontend/workload.html`

## Fix

Check `document.documentElement.dataset.theme` before drawing watermark and use appropriate colors:
```js
const isDark = document.documentElement.dataset.theme === 'dark';
ctx.fillStyle = isDark ? 'rgba(237,224,207,0.15)' : 'rgba(45,31,20,0.15)';
```

Or use `getCanvasTheme()` from app.js if available.

## Acceptance Criteria

- Watermark visible in both light and dark mode on all 10 pages
- Watermark uses theme-appropriate colors
