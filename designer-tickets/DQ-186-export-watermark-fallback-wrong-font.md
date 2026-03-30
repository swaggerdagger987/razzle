---
id: DQ-186
priority: P2
category: brand/watermark
status: open
cycle: 27
---

# 12 standalone pages — export watermark fallback uses `Space Mono` instead of `Caveat`

## What's wrong

The `drawRazzleWatermark()` function in app.js correctly uses `"600 28px Caveat, cursive"` for the watermark font. But 12 standalone pages have a fallback watermark that uses `"bold 28px 'Space Mono', monospace"` — a completely different font.

If app.js fails to load (network issue, CDN timeout, script error), the exported PNG watermark will use the wrong font. Since watermarks appear on every Reddit screenshot, font inconsistency undermines the "polished, intentional" brand feeling.

DESIGN.md specifies: watermarks are personality text → Caveat font.

## Where

All 12 pages have the same fallback pattern:
```javascript
else { ctx.font = "bold 28px 'Space Mono', monospace"; ctx.fillStyle = 'rgba(45,31,20,0.13)'; ctx.fillText("razzle.lol", canvas.width - 220, canvas.height - 20); }
```

| File | Line |
|------|------|
| `frontend/drops.html` | 320 |
| `frontend/gamescript.html` | 311 |
| `frontend/dualthreat.html` | 304 |
| `frontend/garbagetime.html` | 309 |
| `frontend/seasonpace.html` | 290 |
| `frontend/snapefficiency.html` | 303 |
| `frontend/successrate.html` | 303 |
| `frontend/targetpremium.html` | 302 |
| `frontend/tdregression.html` | 320 |
| `frontend/workload.html` | 306 |
| `frontend/aging.html` | ~780 |
| `frontend/buysell.html` | ~745 |

Note: aging.html and buysell.html have a different but related pattern — they use Caveat correctly in their primary watermark but the `else` branch still uses Space Mono.

## Fix

Replace the fallback font:
```javascript
// Before
else { ctx.font = "bold 28px 'Space Mono', monospace"; ...

// After
else { ctx.font = "600 28px Caveat, cursive"; ...
```

Also fix the dark mode color (DQ-161 covers this separately):
```javascript
ctx.fillStyle = document.documentElement.dataset.theme === 'dark' ? 'rgba(237,224,207,0.13)' : 'rgba(45,31,20,0.13)';
```

## Test

1. Temporarily break app.js (rename drawRazzleWatermark).
2. Export PNG from any of the 12 pages.
3. Watermark should use Caveat font, not Space Mono.
