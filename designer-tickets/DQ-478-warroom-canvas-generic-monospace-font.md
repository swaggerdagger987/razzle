---
id: DQ-478
title: warroom.js canvas text uses generic 'monospace' instead of 'Space Mono'
priority: P2
category: typography
status: open
cycle: 60
---

## Problem

The Situation Room pixel canvas renders text (agent HUD labels, furniture details, status text) using `ctx.font = 'bold Npx monospace'` — the generic monospace fallback. The design guide specifies Space Mono as the data font (`--font-mono: 'Space Mono', monospace`).

On most systems, generic `monospace` renders as Courier New or a system mono font, which looks noticeably different from Space Mono used everywhere else on the site. The HUD labels and furniture text feel disconnected from the Razzle brand.

## Evidence

`frontend/warroom.js` — 8 instances:

| Line | Code |
|------|------|
| 357 | `ctx.font = 'bold 10px monospace'` |
| 448 | `ctx.font = 'bold 9px monospace'` |
| 548 | `ctx.font = 'bold 12px monospace'` |
| 551 | `ctx.font = 'bold 9px monospace'` |
| 1008 | `ctx.font = 'bold 8px monospace'` |
| 1078 | `ctx.font = 'bold 10px monospace'` |
| 1240 | `ctx.font = 'bold 9px monospace'` |
| 4160 | `ctx.font = 'bold 14px monospace'` |

## Fix

Replace `monospace` with `'Space Mono', monospace` in all 8 instances. Space Mono is already loaded via Google Fonts on every page, so this is safe:

```javascript
// Before
ctx.font = 'bold 10px monospace';

// After
ctx.font = "bold 10px 'Space Mono', monospace";
```

The monospace fallback stays as a safety net if the font hasn't loaded yet.

## Verification

```bash
grep -n "monospace" frontend/warroom.js
# All 8 should show 'Space Mono', monospace after fix
```

## Files
- `frontend/warroom.js` lines 357, 448, 548, 551, 1008, 1078, 1240, 4160
