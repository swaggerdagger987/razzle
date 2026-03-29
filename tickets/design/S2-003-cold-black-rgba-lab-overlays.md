# S2-003: Cold black rgba(0,0,0) in lab.html modal overlays

**Severity**: S2 (Medium)
**Category**: design
**Source**: DESIGN-QA-TICKETS.md DES-402, DESIGN-TICKETS.md #6
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/lab.html` — Dark mode overlays and shadows use cold black instead of warm espresso:

```css
/* lab.html:908 */  [data-theme="dark"] .filter-modal-overlay { background: rgba(0,0,0,0.5); }
/* lab.html:960 */  [data-theme="dark"] .column-picker-overlay { background: rgba(0,0,0,0.5); }
/* lab.html:1046 */ box-shadow: 0 4px 8px rgba(0,0,0,0.25);
```

Also `frontend/player.js:722` — player profile overlay uses `rgba(0,0,0,0.5)`.

## Fix

```css
/* lab.html:908 */  [data-theme="dark"] .filter-modal-overlay { background: rgba(26,17,10,0.6); }
/* lab.html:960 */  [data-theme="dark"] .column-picker-overlay { background: rgba(26,17,10,0.6); }
/* lab.html:1046 */ box-shadow: 0 4px 8px rgba(45,31,20,0.25);
```

```javascript
// player.js:722
overlay.style.background = 'rgba(45,31,20,0.5)';
```

Use `--bg-ink` RGB (26,17,10) for dark overlays, `--ink` RGB (45,31,20) for light mode shadows.

## Files to Change

- `frontend/lab.html:908,960,1046`
- `frontend/player.js:722`

## Accept When

Zero instances of `rgba(0,0,0` in lab.html and player.js.
