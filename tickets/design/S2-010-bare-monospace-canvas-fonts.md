# S2-010: 17 bare "monospace" canvas font calls — should use Space Mono

**Severity**: S2 (Medium)
**Category**: design
**Source**: EDGE-CASES.md #47
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

17 canvas `ctx.font` assignments use generic `monospace` without specifying `'Space Mono'` (the project's data font per DESIGN.md). This causes browser-default monospace (Courier New) instead of Space Mono.

**lab-panels.js** (9 instances):
- Line 5701: `ctx.font = '10px monospace';`
- Line 5730: `ctx.font = 'bold 10px monospace';`
- Line 5733: `ctx.font = '10px monospace';`
- Line 5738: `ctx.font = '11px monospace';`
- Line 5890: `ctx.font = '10px monospace';`
- Line 5896: `ctx.font = '10px monospace';`
- Line 6808: `ctx.font = 'bold 11px monospace';`
- Line 6819: `ctx.font = 'bold 24px monospace';`
- Line 6823: `ctx.font = '12px monospace';`

**warroom.js** (8 instances):
- Line 357: `ctx.font = 'bold 10px monospace';`
- Line 448: `ctx.font = 'bold 9px monospace';`
- Line 548: `ctx.font = 'bold 12px monospace';`
- Line 551: `ctx.font = 'bold 9px monospace';`
- Line 1008: `ctx.font = 'bold 8px monospace';`
- Line 1078: `ctx.font = 'bold 10px monospace';`
- Line 1240: `ctx.font = 'bold 9px monospace';`
- Line 4160: `ctx.font = 'bold 14px monospace';`

## Fix

Replace `monospace` with `'Space Mono', monospace` in all 17 occurrences:
```javascript
ctx.font = '10px "Space Mono", monospace';
```

## Files to Change

- `frontend/lab-panels.js` — 9 occurrences
- `frontend/warroom.js` — 8 occurrences

## Accept When

Zero instances of `ctx.font` containing bare `monospace` without `Space Mono` in any JS file.
