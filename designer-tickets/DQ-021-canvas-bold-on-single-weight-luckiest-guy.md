# DQ-021: Canvas `bold` keyword on single-weight Luckiest Guy

**Priority**: P1 — 47 instances across 4 core JS files
**Category**: Typography
**Severity**: HIGH — Can cause FOUT (Flash of Unstyled Text) and font rendering inconsistency

## Problem

Luckiest Guy is a single-weight display font. It only ships one weight. Adding `bold` to canvas `ctx.font` strings is meaningless — the browser either ignores it (wasted parse) or synthesizes a fake bold that looks wrong.

47 instances across:
- `lab.js` — 37 instances (lines 5896, 6196, 7044, 7051, 7075, 7132, 7792, 7810, 7859, 8017, 8029, 8178, 8263, 8276, 8540, 8592, 8921, 9036, 9393, 9758, 9989, 10352, 11060, 11176, 11268, 11917, 11936, 11942, 12121, 12440, 12492, 12499, 12508, 12929, 12937, 12959, 12984)
- `charts.js` — 3 instances (lines 579, 676, 1098)
- `compare.js` — 4 instances (lines 616, 720, 726, 771)
- `player.js` — 3 instances (lines 599, 605, 629)

## Example

```javascript
// WRONG:
ctx.font = "bold 24px 'Luckiest Guy', cursive";

// CORRECT:
ctx.font = "24px 'Luckiest Guy', cursive";
```

## Fix

Regex replace across all 4 files:
```
bold (\d+px 'Luckiest Guy') → $1
```

Test: Canvas headings should render identically (Luckiest Guy has no bold variant to lose).
