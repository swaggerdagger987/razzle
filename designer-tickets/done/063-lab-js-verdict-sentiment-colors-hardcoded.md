# DES-063: lab.js verdict/sentiment colors hardcoded — trade analyzer dark mode breaks

**Priority**: P2
**Area**: frontend/lab.js lines 10874-10887 and 11123-11132 (Trade Analyzer)
**Cycle**: 6

## Problem

The Trade Analyzer verdict badge (WIN/FAIR/LOSS) uses hardcoded hex for both text and background colors. These colors are defined twice (DOM version and canvas version) and don't adapt to dark mode.

## Current Code

```javascript
// Lines 10874-10887 (DOM)
if (pctDiff <= 10) {
  verdict = "FAIR";
  verdictColor = "#c5a000";   // gold text
  verdictBg = "#f5eacc";      // gold bg (= --yellow-light)
} else if (diff > 0) {
  verdict = "WIN";
  verdictColor = "#2ec4b6";   // teal text (= --green)
  verdictBg = "#d9efec";      // teal bg (= --green-light)
} else {
  verdict = "LOSS";
  verdictColor = "#e63946";   // red text (= --red)
  verdictBg = "#f2d5d8";      // red bg (= --red-light)
}
```

Same pattern repeated at lines 11123-11132 for canvas export.

## Fix

Replace hardcoded hex with CSS variables:

```javascript
verdictColor = "var(--yellow)";  verdictBg = "var(--yellow-light)";  // FAIR
verdictColor = "var(--green)";   verdictBg = "var(--green-light)";   // WIN
verdictColor = "var(--red)";     verdictBg = "var(--red-light)";     // LOSS
```

For canvas version (lines 11123-11132), use `getCanvasTheme()` or `getComputedStyle()` to read the CSS variable values.

**Note**: `#c5a000` is not even a design system color — it's an orphaned gold that doesn't match `--yellow` (#ffc857). The FAIR verdict should use the actual yellow from DESIGN.md.

## Why This Matters

The Trade Analyzer is a key conversion feature — users evaluate trades before upgrading. The verdict badge is the emotional climax of the trade analysis. In dark mode, `#f5eacc` background on `#2d1f14` background creates a jarring contrast break.

## Design Rule

DESIGN.md accent colors: `--yellow: #ffc857`, `--green: #2ec4b6`, `--red: #e63946`. Light tints defined as `--yellow-light`, `--green-light`, `--red-light`. Use the tokens.
