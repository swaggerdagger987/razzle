# DES-080: Trade Analyzer PNG export uses hardcoded light-mode panel backgrounds

**Priority**: P1
**Area**: frontend/lab.js lines 11082-11083
**Cycle**: 8

## Problem

The Trade Analyzer's PNG export canvas render uses hardcoded light-mode tint colors:

```javascript
drawSide(giveX, "I GIVE", "#f2d5d8", "#e63946", _taState.give);
drawSide(getX, "I GET", "#d9efec", "#2ec4b6", _taState.get);
```

`#f2d5d8` is `--red-light` (light mode) and `#d9efec` is `--green-light` (light mode). In dark mode, these pale pastel panel backgrounds appear against the espresso card background — a jarring visual mismatch.

**PNG exports are marketing.** Every exported trade analysis shared on Reddit or in a group chat carries the razzle.lol watermark. If a dark mode user exports a trade analysis, the pastel backgrounds look broken against the dark export background. This undermines the "polished tool" impression.

## Fix

Use the canvas theme system or read light tints from CSS:

```javascript
const styles = getComputedStyle(document.documentElement);
const redLight = styles.getPropertyValue('--red-light').trim() || "#f2d5d8";
const greenLight = styles.getPropertyValue('--green-light').trim() || "#d9efec";

drawSide(giveX, "I GIVE", redLight, "#e63946", _taState.give);
drawSide(getX, "I GET", greenLight, "#2ec4b6", _taState.get);
```

The accent colors (`#e63946`, `#2ec4b6`) are the same in both modes per DESIGN.md, so they can stay hardcoded (or use theme properties after DES-069).

## Design Rule

DESIGN.md: Light tints shift in dark mode to muted deep versions (e.g., `--red-light` goes from `#f2d5d8` to dark mode equivalent). PNG exports must respect the user's theme.
