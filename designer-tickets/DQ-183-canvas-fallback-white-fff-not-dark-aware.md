---
id: DQ-183
priority: P2
category: dark-mode/canvas
status: open
cycle: 27
---

# Canvas theme fallback `white:'#fff'` in 6 HTML files — not dark-mode-aware

## What's wrong

6 standalone pages define a canvas theme fallback object with `white:'#fff'`. The real `getCanvasTheme()` in app.js returns `white: isDark ? "#ede0cf" : "#fff"` — in dark mode, it maps white to sand. But the fallback hardcodes `#fff`, which is bright white on a dark espresso canvas if app.js fails to load.

The `white` value is used for chart strokes and label backgrounds. Bright `#fff` on `#2d1f14` background is harsh and glaring vs the intended warm sand `#ede0cf`.

## Where

All 6 files have the identical fallback pattern:
```javascript
var t = typeof getCanvasTheme === 'function' ? getCanvasTheme() : {bg:'#ede0cf',bgCard:'#f7efe5',ink:'#2d1f14',inkMedium:'#5c4a3d',inkLight:'#8a7565',inkFaint:'#c4b5a5',white:'#fff'};
```

| File | Line |
|------|------|
| `frontend/aging.html` | 444 |
| `frontend/breakdown.html` | 668 |
| `frontend/career.html` | 814 |
| `frontend/career-compare.html` | 746 |
| `frontend/draftclass.html` | 583 |
| `frontend/explorer.html` | 411 |

## Fix

Make the fallback theme-aware:
```javascript
var _isDark = document.documentElement.dataset.theme === 'dark';
var t = typeof getCanvasTheme === 'function' ? getCanvasTheme() : {
  bg: _isDark ? '#2d1f14' : '#ede0cf',
  bgCard: _isDark ? '#4a3728' : '#f7efe5',
  ink: _isDark ? '#ede0cf' : '#2d1f14',
  inkMedium: _isDark ? '#c4b5a5' : '#5c4a3d',
  inkLight: '#8a7565',
  inkFaint: _isDark ? '#5c4a3d' : '#c4b5a5',
  white: _isDark ? '#ede0cf' : '#fff'
};
```

## Test

1. Disable app.js (add a syntax error or rename temporarily).
2. Open any of the 6 pages in dark mode.
3. Canvas charts should use sand (#ede0cf) for white elements, not bright #fff.
