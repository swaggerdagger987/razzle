# DQ-161: Canvas watermark text invisible in dark mode — 10 pages

**Priority:** P2
**Area:** Dark Mode / Canvas
**Type:** Dark mode regression
**Impact:** Watermark disappears in dark mode screenshots — brand attribution lost on shared images

---

## Problem

10 canvas-based standalone pages draw a fallback watermark using hardcoded `rgba(45,31,20,0.13)` (dark brown text). In dark mode, the canvas background is also dark brown, making the watermark invisible. Other canvas pages correctly check `document.documentElement.dataset.theme` for html2canvas background but NOT for the watermark text.

## Evidence

All 10 pages have identical pattern:
```javascript
else { ctx.font = "bold 28px 'Space Mono', monospace"; ctx.fillStyle = 'rgba(45,31,20,0.13)'; ctx.fillText("razzle.lol", canvas.width - 220, canvas.height - 20); }
```

### Affected files
- `drops.html:320`
- `gamescript.html:311`
- `dualthreat.html:304`
- `garbagetime.html:309`
- `seasonpace.html:290`
- `snapefficiency.html:303`
- `successrate.html:303`
- `targetpremium.html:302`
- `tdregression.html:320`
- `workload.html:306`

Note: Each page already checks theme for html2canvas background (e.g., `drops.html:317`), so the pattern exists — it just wasn't applied to the watermark fallback.

## Fix

Replace the hardcoded fillStyle with a theme-aware check:
```javascript
ctx.fillStyle = document.documentElement.dataset.theme === 'dark' ? 'rgba(237,224,207,0.13)' : 'rgba(45,31,20,0.13)';
```

## Verification
- Toggle dark mode, export PNG from any of the 10 pages — watermark should be visible on both light and dark backgrounds.
