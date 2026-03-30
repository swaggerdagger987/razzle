# DES-070: lab.js has 6+ duplicated tier/grade color objects — DRY violation

**Priority**: P2
**Area**: frontend/lab.js (multiple functions)
**Cycle**: 7

## Problem

`tierColors` and `gradeColors` objects are defined 6+ separate times across different functions in lab.js. Each is a standalone copy with slightly different values:

| Line | Object | Context | Values |
|------|--------|---------|--------|
| 8086 | tierColors | Prospect canvas | elite=#2ec4b6, above_avg=#2ec4b6, average=#ffc857, below_avg=#d97757 |
| 8407-8410 | tierDefs | Prospect canvas | elite=#2ec4b6, premium=#2ec4b6, solid=#ffc857, flier=#d97757 |
| 8611 | gradeColors | Draft DOM | A=var(--green), B=var(--blue), C=var(--orange), D=var(--red) |
| 8612 | tierColors | Draft DOM | elite=#d97757, premium=#5b7fff, solid=#2ec4b6, flier=#8b5cf6 |
| 8700 | gradeColors | Draft canvas | A=#2ec4b6, B=#5b7fff, C=#d97757, D=#e63946 |
| 8792-8793 | Both | Export canvas | Duplicates of 8700 + 8612 |
| 9059-9062 | tiers | TV DOM | Elite=#2ec4b6, Star=#5b7fff, Starter=#d97757, Bench=#8a7565 |
| 9248-9251 | tiers | TV PNG | Duplicate of 9059 |

**Inconsistency bug**: Line 8407 uses `#2ec4b6` for BOTH elite AND premium. Line 8612 uses different colors for each. Which is correct?

## Fix

1. Define DOM-context tier/grade constants at the top of lab.js using CSS vars:
   ```javascript
   const TIER_COLORS_CSS = { elite: "var(--green)", premium: "var(--blue)", solid: "var(--orange)", flier: "var(--purple)" };
   const GRADE_COLORS_CSS = { A: "var(--green)", B: "var(--blue)", C: "var(--orange)", D: "var(--red)" };
   ```

2. Define canvas-context constants (after DES-069 is done):
   ```javascript
   function _getTierColorsHex() { const t = getCanvasTheme(); return { elite: t.green, premium: t.blue, solid: t.orange, flier: t.purple }; }
   ```

3. Replace all 6+ inline definitions with references to these constants.

## Design Rule

DRY. Also: accent color usage should be consistent (is elite green or orange? Decide once).
