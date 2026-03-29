---
id: S2-110
severity: S2
confidence: HIGH
category: design
source: DQ-249+289+381+383+458+477+490
status: OPEN
---

# Canvas drawing uses 20+ hardcoded hex colors — dark mode broken

## Root Cause (UPDATED 2026-03-29 — code investigation)

**46 total instances** of hardcoded hex colors in canvas drawing code. `getCanvasTheme()` is defined at `frontend/app.js:96-118` but not used consistently.

### Breakdown by file:

| File | Count | Key lines |
|------|-------|-----------|
| `lab.js` | 23 | 5864,5902,6312,6398,7666,9533,9564,9667,10039,11234,12875,12877,12913,12921,12930,12938,12991,12995,13157,13165,13171,13179,13211,13215 |
| `charts.js` | 9 | 379,387,450,491,533,549,561,1215,1490 |
| `warroom.js` | 8 | 356,424,427,442,444,447,521,527 |
| `lab-panels.js` | 6 | 4962,4969,7279,7532,9968,10095 |

### Hardcoded colors found:
`#d97757`, `#e63946`, `#2ec4b6`, `#5b7fff`, `#8B4513`, `#f7efe5`, `#2d1f14`, `#8a7565`, `#ffc857`, `#000`, and various `rgba()` variants.

All should use `getCanvasTheme()` properties: `t.ink`, `t.bg`, `t.orange`, `t.posQB`, etc.

## Fix

All canvas drawing should use `getCanvasTheme()` (already defined in `app.js`) which returns theme-aware colors. Replace hardcoded hex with `t.ink`, `t.bg`, `t.orange`, etc.

## Files

- `frontend/app.js` — `getCanvasTheme()` should read CSS vars, not hardcode
- `frontend/lab.js` — boom/bust canvas
- `frontend/lab-panels.js` — scatter plots, charts
- `frontend/compare.js` — radar chart fill/stroke
- `frontend/warroom.js` — overlay colors

## Acceptance Criteria

1. Toggle dark mode. All canvas-drawn elements use dark palette.
2. PNG exports respect current theme
3. No hardcoded `#d97757`, `#fff`, or `rgba(0,0,0)` in canvas code (except warroom pixel art)
